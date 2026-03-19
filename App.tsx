import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { PlayerProvider } from './src/context/PlayerContext';
import TrackPlayer, { Capability } from 'react-native-track-player';

LogBox.ignoreLogs(['new NativeEventEmitter']);

async function setupPlayer() {
  try {
    await TrackPlayer.setupPlayer({
      maxCacheSize: 1024 * 5, // 5 MB cache
    });
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });
  } catch (e) {
    console.log('Player already setup or error:', e);
  }
}

export default function App() {
  useEffect(() => {
    setupPlayer();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: '#ff4500',
              background: '#0a0a0f',
              card: '#0f0f1a',
              text: '#ffffff',
              border: '#1e1e2e',
              notification: '#ff4500',
            },
          }}>
          <PlayerProvider>
            <RootNavigator />
          </PlayerProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
