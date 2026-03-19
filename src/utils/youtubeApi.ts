import axios from 'axios';

// =====================================================
// IMPORTANTE: Insira sua chave da YouTube Data API v3
// Obtenha em: https://console.cloud.google.com
// Ative: YouTube Data API v3
// =====================================================
const YOUTUBE_API_KEY = 'SUA_CHAVE_API_AQUI';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YTSearchResult {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
}

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] || '0');
  const m = parseInt(match[2] || '0');
  const s = parseInt(match[3] || '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatViews(count: string): string {
  const n = parseInt(count);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`;
  return `${n} views`;
}

export async function searchYouTube(query: string): Promise<YTSearchResult[]> {
  // Step 1: Search
  const searchRes = await axios.get(`${BASE_URL}/search`, {
    params: {
      key: YOUTUBE_API_KEY,
      q: query,
      part: 'snippet',
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: 20,
      fields: 'items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails)',
    },
  });

  const items = searchRes.data.items;
  if (!items || items.length === 0) return [];

  const videoIds = items.map((i: any) => i.id.videoId).join(',');

  // Step 2: Get durations and stats
  const detailRes = await axios.get(`${BASE_URL}/videos`, {
    params: {
      key: YOUTUBE_API_KEY,
      id: videoIds,
      part: 'contentDetails,statistics',
      fields: 'items(id,contentDetails/duration,statistics/viewCount)',
    },
  });

  const details: Record<string, any> = {};
  detailRes.data.items.forEach((item: any) => {
    details[item.id] = item;
  });

  return items.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'"),
    artist: item.snippet.channelTitle,
    thumbnail:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.default?.url ||
      '',
    duration: details[item.id.videoId]
      ? parseDuration(details[item.id.videoId].contentDetails.duration)
      : '0:00',
    viewCount: details[item.id.videoId]?.statistics?.viewCount
      ? formatViews(details[item.id.videoId].statistics.viewCount)
      : '',
  }));
}

export async function getTrendingMusic(regionCode = 'BR'): Promise<YTSearchResult[]> {
  const res = await axios.get(`${BASE_URL}/videos`, {
    params: {
      key: YOUTUBE_API_KEY,
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      videoCategoryId: '10',
      regionCode,
      maxResults: 20,
      fields:
        'items(id,snippet/title,snippet/channelTitle,snippet/thumbnails,contentDetails/duration,statistics/viewCount)',
    },
  });

  return res.data.items.map((item: any) => ({
    videoId: item.id,
    title: item.snippet.title
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'"),
    artist: item.snippet.channelTitle,
    thumbnail:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.default?.url ||
      '',
    duration: parseDuration(item.contentDetails.duration),
    viewCount: formatViews(item.statistics.viewCount),
  }));
}
