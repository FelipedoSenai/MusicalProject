import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player';

export interface Track {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  viewCount?: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  playTrack: (track: Track) => void;
  pauseResume: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  addToQueue: (track: Track) => void;
  setProgress: (val: number) => void;
  youtubeRef: React.MutableRefObject<any>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const youtubeRef = useRef<any>(null);

  const playTrack = useCallback(
    async (track: Track) => {
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgressState(0);

      // Add to queue if not present
      setQueue(prev => {
        const exists = prev.find(t => t.videoId === track.videoId);
        if (!exists) return [...prev, track];
        return prev;
      });
    },
    [],
  );

  const pauseResume = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const skipNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex(t => t.videoId === currentTrack.videoId);
    const next = queue[idx + 1] || queue[0];
    playTrack(next);
  }, [currentTrack, queue, playTrack]);

  const skipPrevious = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex(t => t.videoId === currentTrack.videoId);
    const prev = queue[idx - 1] || queue[queue.length - 1];
    playTrack(prev);
  }, [currentTrack, queue, playTrack]);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => {
      const exists = prev.find(t => t.videoId === track.videoId);
      if (!exists) return [...prev, track];
      return prev;
    });
  }, []);

  const setProgress = useCallback((val: number) => {
    setProgressState(val);
    if (youtubeRef.current) {
      youtubeRef.current.seekTo(val, true);
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        progress,
        playTrack,
        pauseResume,
        skipNext,
        skipPrevious,
        addToQueue,
        setProgress,
        youtubeRef,
      }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}
