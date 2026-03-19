import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayer, Track } from '../context/PlayerContext';

export default function QueueScreen() {
  const { queue, currentTrack, playTrack } = usePlayer();

  const renderItem = ({ item, index }: { item: Track; index: number }) => {
    const isActive = currentTrack?.videoId === item.videoId;
    return (
      <TouchableOpacity
        style={[styles.item, isActive && styles.itemActive]}
        onPress={() => playTrack(item)}
        activeOpacity={0.7}>
        <Text style={styles.indexText}>{String(index + 1).padStart(2, '0')}</Text>
        <View style={styles.thumb}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.thumbImg} />
          ) : (
            <View style={[styles.thumbImg, styles.thumbPlaceholder]}>
              <Text>🎵</Text>
            </View>
          )}
          {isActive && (
            <View style={styles.activeOverlay}>
              <Text style={{ color: '#fff', fontSize: 12 }}>▶</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, isActive && styles.titleActive]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
        </View>
        <Text style={styles.dur}>{item.duration}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fila de Reprodução</Text>
        <Text style={styles.headerSub}>{queue.length} músicas</Text>
      </View>
      {queue.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <Text style={styles.emptyText}>A fila está vazia</Text>
          <Text style={styles.emptySubText}>Toque em uma música para começar</Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={item => item.videoId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { padding: 24, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: '#ff4500', marginTop: 4, fontWeight: '700', letterSpacing: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  itemActive: { backgroundColor: '#1a1020' },
  indexText: { width: 24, fontSize: 12, color: '#555', textAlign: 'center', fontVariant: ['tabular-nums'] },
  thumb: { width: 48, height: 48, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumbImg: { width: 48, height: 48, borderRadius: 10 },
  thumbPlaceholder: { backgroundColor: '#1e1e2e', justifyContent: 'center', alignItems: 'center' },
  activeOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(255,69,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#ccc' },
  titleActive: { color: '#ff6030' },
  artist: { fontSize: 12, color: '#555', marginTop: 2 },
  dur: { fontSize: 12, color: '#444', fontVariant: ['tabular-nums'] },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 56 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#ccc' },
  emptySubText: { fontSize: 14, color: '#555' },
});
