import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchYouTube, getTrendingMusic, YTSearchResult } from '../utils/youtubeApi';
import { usePlayer, Track } from '../context/PlayerContext';
import MiniPlayer from '../components/MiniPlayer';
import HiddenYouTubePlayer from '../components/HiddenYouTubePlayer';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YTSearchResult[]>([]);
  const [trending, setTrending] = useState<YTSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const { playTrack, currentTrack } = usePlayer();

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setLoading(true);
    try {
      const data = await getTrendingMusic('BR');
      setTrending(data);
    } catch (e) {
      console.log('Trending error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSearchMode(true);
    try {
      const data = await searchYouTube(query);
      setResults(data);
    } catch (e) {
      console.log('Search error:', e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleClearSearch = () => {
    setQuery('');
    setSearchMode(false);
    setResults([]);
  };

  const handlePlay = (item: YTSearchResult) => {
    const track: Track = {
      id: item.videoId,
      videoId: item.videoId,
      title: item.title,
      artist: item.artist,
      thumbnail: item.thumbnail,
      duration: item.duration,
      viewCount: item.viewCount,
    };
    playTrack(track);
  };

  const displayList = searchMode ? results : trending;
  const sectionLabel = searchMode ? `Resultados para "${query}"` : 'Em Alta no Brasil 🇧🇷';

  const renderItem = ({ item, index }: { item: YTSearchResult; index: number }) => {
    const isActive = currentTrack?.videoId === item.videoId;
    return (
      <TouchableOpacity
        style={[styles.trackItem, isActive && styles.trackItemActive]}
        onPress={() => handlePlay(item)}
        activeOpacity={0.7}>
        <View style={styles.trackThumb}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.thumbImg} />
          ) : (
            <View style={[styles.thumbImg, styles.thumbPlaceholder]}>
              <Text style={{ fontSize: 20 }}>🎵</Text>
            </View>
          )}
          {isActive && (
            <View style={styles.nowPlayingOverlay}>
              <Text style={{ color: '#fff', fontSize: 16 }}>▶</Text>
            </View>
          )}
        </View>
        <View style={styles.trackInfo}>
          <Text
            style={[styles.trackTitle, isActive && styles.trackTitleActive]}
            numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.trackSub} numberOfLines={1}>
            {item.artist}
            {item.viewCount ? ` • ${item.viewCount}` : ''}
          </Text>
        </View>
        <Text style={styles.trackDuration}>{item.duration}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Hidden YouTube player for background audio */}
      <HiddenYouTubePlayer />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>YTunes</Text>
        <Text style={styles.tagline}>Música sem limites</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar música, artista, álbum..."
            placeholderTextColor="#555"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            blurOnSubmit
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {query.length > 0 && (
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Buscar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Section label */}
      <Text style={styles.sectionLabel}>{sectionLabel}</Text>

      {/* Track list */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="#ff4500" size="large" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={item => item.videoId}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: currentTrack ? 100 : 20 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={styles.emptyText}>
                {searchMode
                  ? 'Nenhum resultado encontrado'
                  : 'Sem músicas em alta agora'}
              </Text>
            </View>
          }
        />
      )}

      {/* Mini player */}
      {currentTrack && <MiniPlayer />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
  tagline: { fontSize: 12, color: '#ff4500', marginTop: 2, letterSpacing: 1 },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161620',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2a3a',
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'System',
  },
  clearBtn: { color: '#666', fontSize: 16, paddingHorizontal: 4 },
  searchBtn: {
    backgroundColor: '#ff4500',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionLabel: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#ff4500',
    textTransform: 'uppercase',
  },
  list: { paddingHorizontal: 16 },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 14,
    marginBottom: 4,
  },
  trackItemActive: { backgroundColor: '#1a1020' },
  trackThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImg: { width: 56, height: 56, borderRadius: 10 },
  thumbPlaceholder: {
    backgroundColor: '#1e1e2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,69,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 14, fontWeight: '600', color: '#e0e0e0', lineHeight: 20 },
  trackTitleActive: { color: '#ff6030' },
  trackSub: { fontSize: 12, color: '#666', marginTop: 2 },
  trackDuration: {
    fontSize: 12,
    color: '#444',
    fontVariant: ['tabular-nums'],
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#555', fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#555', fontSize: 15, textAlign: 'center' },
});
