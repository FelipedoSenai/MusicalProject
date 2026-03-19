import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { useNavigation } from '@react-navigation/native';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, pauseResume, skipNext, youtubeRef } = usePlayer();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const pulseAnim = new Animated.Value(1);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!isPlaying) return;

    // Pulse animation for playing indicator
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(async () => {
      try {
        if (youtubeRef.current) {
          const t = await youtubeRef.current.getCurrentTime();
          const d = await youtubeRef.current.getDuration();
          setCurrentTime(t);
          setDuration(d);
        }
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, youtubeRef]);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Player')}
      activeOpacity={0.9}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.content}>
        {/* Thumbnail */}
        <View style={styles.thumbContainer}>
          {currentTrack.thumbnail ? (
            <Image
              source={{ uri: currentTrack.thumbnail }}
              style={styles.thumb}
            />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Text style={{ fontSize: 18 }}>🎵</Text>
            </View>
          )}
          {isPlaying && (
            <Animated.View
              style={[styles.playingDot, { transform: [{ scale: pulseAnim }] }]}
            />
          )}
        </View>

        {/* Track info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={pauseResume} style={styles.controlBtn}>
            <Text style={styles.controlIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={skipNext} style={styles.controlBtn}>
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // above tab bar
    left: 8,
    right: 8,
    backgroundColor: '#1a1020',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ff450030',
    elevation: 12,
    shadowColor: '#ff4500',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
  },
  progressTrack: {
    height: 2,
    backgroundColor: '#2a2a3a',
  },
  progressFill: {
    height: 2,
    backgroundColor: '#ff4500',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  thumbContainer: {
    position: 'relative',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  thumbPlaceholder: {
    backgroundColor: '#1e1e2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4500',
    borderWidth: 1,
    borderColor: '#1a1020',
  },
  info: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  artist: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: 4,
  },
  controlBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
    color: '#fff',
  },
});
