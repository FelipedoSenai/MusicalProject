import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { usePlayer } from '../context/PlayerContext';

/**
 * HiddenYouTubePlayer
 *
 * Este componente renderiza o player do YouTube de forma invisível (1x1 px)
 * e gerencia a reprodução em segundo plano usando o WebView.
 *
 * Para reprodução em segundo plano funcionar no Android:
 * - O WebView usa allowsInlineMediaPlayback + mediaPlaybackRequiresUserAction=false
 * - O app precisa das permissões WAKE_LOCK no AndroidManifest.xml
 * - O TrackPlayer gerencia a notificação na barra de status
 */
export default function HiddenYouTubePlayer() {
  const { currentTrack, isPlaying, youtubeRef, skipNext } = usePlayer();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, []);

  if (!currentTrack) return null;

  return (
    <View style={styles.hidden} pointerEvents="none">
      <YoutubeIframe
        ref={youtubeRef}
        height={1}
        width={1}
        videoId={currentTrack.videoId}
        play={isPlaying}
        onChangeState={state => {
          if (state === 'ended') skipNext();
        }}
        onError={e => console.log('YT Error:', e)}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
          // Allows background audio on Android
          androidLayerType: 'hardware',
        }}
        initialPlayerParams={{
          preventFullScreen: true,
          controls: false,
          modestbranding: true,
          rel: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    top: -10,
    left: -10,
    opacity: 0,
    pointerEvents: 'none',
  },
});
