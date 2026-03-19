import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { usePlayer } from '../context/PlayerContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const {
    currentTrack,
    isPlaying,
    pauseResume,
    skipNext,
    skipPrevious,
    setProgress,
    youtubeRef,
    addToQueue,
  } = usePlayer();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isSeeking) {
        try {
          if (youtubeRef.current) {
            const t = await youtubeRef.current.getCurrentTime();
            const d = await youtubeRef.current.getDuration();
            setCurrentTime(t);
            setDuration(d);
            setSliderValue(d > 0 ? t / d : 0);
          }
        } catch {}
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isSeeking, youtubeRef]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noTrack}>Nenhuma música tocando</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>⌄</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tocando Agora</Text>
        <TouchableOpacity
          onPress={() => currentTrack && addToQueue(currentTrack)}
          style={styles.moreBtn}>
          <Text style={styles.moreIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Album art */}
      <View style={styles.artContainer}>
        {currentTrack.thumbnail ? (
          <Image
            source={{ uri: currentTrack.thumbnail }}
            style={styles.artwork}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]}>
            <Text style={styles.artworkEmoji}>🎵</Text>
          </View>
        )}
        {isPlaying && (
          <View style={styles.playingBadge}>
            <Text style={styles.playingBadgeText}>● AO VIVO</Text>
          </View>
        )}
      </View>

      {/* Track info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={2}>
          {currentTrack.title}
        </Text>
        <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
        {currentTrack.viewCount && (
          <Text style={styles.viewCount}>{currentTrack.viewCount}</Text>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={sliderValue}
          minimumTrackTintColor="#ff4500"
          maximumTrackTintColor="#2a2a3a"
          thumbTintColor="#ff4500"
          onSlidingStart={() => setIsSeeking(true)}
          onValueChange={val => setSliderValue(val)}
          onSlidingComplete={val => {
            setIsSeeking(false);
            const seekTo = val * duration;
            setCurrentTime(seekTo);
            if (youtubeRef.current) {
              youtubeRef.current.seekTo(seekTo, true);
            }
          }}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.sideBtn} onPress={skipPrevious}>
          <Text style={styles.sideBtnIcon}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playBtn} onPress={pauseResume}>
          <Text style={styles.playBtnIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideBtn} onPress={skipNext}>
          <Text style={styles.sideBtnIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Extra controls */}
      <View style={styles.extraControls}>
        <TouchableOpacity style={styles.extraBtn}>
          <Text style={styles.extraBtnIcon}>🔀</Text>
          <Text style={styles.extraBtnLabel}>Aleatório</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraBtn}>
          <Text style={styles.extraBtnIcon}>🔁</Text>
          <Text style={styles.extraBtnLabel}>Repetir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraBtn}>
          <Text style={styles.extraBtnIcon}>❤</Text>
          <Text style={styles.extraBtnLabel}>Favorito</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  noTrack: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#fff', fontSize: 28, lineHeight: 32 },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  moreBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  moreIcon: { color: '#fff', fontSize: 24, letterSpacing: 2 },
  artContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    position: 'relative',
  },
  artwork: {
    width: width - 64,
    height: width - 64,
    borderRadius: 24,
  },
  artworkPlaceholder: {
    backgroundColor: '#1e1e2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkEmoji: { fontSize: 64 },
  playingBadge: {
    position: 'absolute',
    top: 16,
    right: 48,
    backgroundColor: 'rgba(255,69,0,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  playingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  trackInfo: {
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  trackArtist: { fontSize: 15, color: '#888', marginTop: 6 },
  viewCount: { fontSize: 12, color: '#ff4500', marginTop: 4, fontWeight: '700' },
  progressContainer: { paddingHorizontal: 24, marginBottom: 8 },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -6 },
  timeText: { fontSize: 12, color: '#666', fontVariant: ['tabular-nums'] },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 28,
  },
  sideBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideBtnIcon: { fontSize: 28, color: '#ccc' },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ff4500',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#ff4500',
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  playBtnIcon: { fontSize: 28, color: '#fff', marginLeft: 4 },
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 32,
  },
  extraBtn: { alignItems: 'center', gap: 4 },
  extraBtnIcon: { fontSize: 22 },
  extraBtnLabel: { fontSize: 11, color: '#666', fontWeight: '600' },
});
