# 🎵 YTunes — Player de Música do YouTube

App React Native para ouvir músicas do YouTube com suporte a **reprodução em segundo plano**.

---

## 📋 Pré-requisitos

- Node.js 18+
- Java JDK 17
- Android Studio + SDK
- React Native CLI

```bash
npm install -g react-native-cli
```

---

## 🚀 Instalação

### 1. Instalar dependências

```bash
cd YTunes
npm install
```

### 2. Configurar a YouTube Data API v3

> **Obrigatório** para que a busca e músicas em alta funcionem.

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto novo (ou use um existente)
3. Vá em **APIs e Serviços** → **Biblioteca**
4. Busque e ative: **YouTube Data API v3**
5. Vá em **Credenciais** → **Criar Credenciais** → **Chave de API**
6. Copie a chave gerada
7. Abra o arquivo `src/utils/youtubeApi.ts`
8. Substitua `SUA_CHAVE_API_AQUI` pela sua chave

```typescript
const YOUTUBE_API_KEY = 'AIza...sua_chave_aqui...';
```

> ⚠️ A API do YouTube oferece **10.000 unidades/dia grátis**, suficiente para uso pessoal.

---

## 📱 Rodando no Android

```bash
# Conecte um celular Android com depuração USB habilitada, ou inicie um emulador

# Terminal 1 - Metro bundler
npx react-native start

# Terminal 2 - Build e instalação
npx react-native run-android
```

---

## 📦 Gerando o APK (Release)

```bash
cd android

# Gerar APK de release
./gradlew assembleRelease

# APK gerado em:
# android/app/build/outputs/apk/release/app-release.apk
```

> Para assinar o APK para distribuição, siga: [React Native - Publishing to Google Play](https://reactnative.dev/docs/signed-apk-android)

---

## 🎵 Reprodução em Segundo Plano

O app usa duas estratégias combinadas:

1. **react-native-youtube-iframe** — Player do YouTube invisível (1x1px) que continua tocando mesmo com a tela bloqueada via WebView
2. **react-native-track-player** — Gerencia a notificação na barra de status com controles de play/pause/skip

### Configuração do Android

O `AndroidManifest.xml` já inclui as permissões necessárias:
- `WAKE_LOCK` — Mantém o processador ativo durante reprodução
- `FOREGROUND_SERVICE` — Permite serviço em primeiro plano
- `FOREGROUND_SERVICE_MEDIA_PLAYBACK` — Específico para mídia

---

## 🗂️ Estrutura do Projeto

```
YTunes/
├── App.tsx                          # Entry point
├── src/
│   ├── context/
│   │   └── PlayerContext.tsx        # Estado global do player
│   ├── navigation/
│   │   └── RootNavigator.tsx        # Navegação (tabs + stack)
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Busca + músicas em alta
│   │   ├── PlayerScreen.tsx         # Player completo
│   │   └── QueueScreen.tsx          # Fila de reprodução
│   ├── components/
│   │   ├── HiddenYouTubePlayer.tsx  # Player invisível (segundo plano)
│   │   └── MiniPlayer.tsx           # Barra inferior de controle
│   └── utils/
│       └── youtubeApi.ts            # YouTube Data API v3
└── android/
    └── app/src/main/
        └── AndroidManifest.xml      # Permissões Android
```

---

## ⚡ Features

- 🔍 Busca qualquer música no YouTube
- 📈 Músicas em alta no Brasil
- 🎵 Player completo com seek bar
- 📱 Mini player na barra inferior
- 🔄 Fila de reprodução
- ⏮⏭ Pular faixas
- 🌙 Tema escuro (dark mode)
- 📡 **Reprodução em segundo plano**

---

## ⚠️ Observações Legais

Este app utiliza a **YouTube IFrame API** e a **YouTube Data API v3**, que são oficialmente disponibilizadas pelo Google. O uso está sujeito aos [Termos de Serviço do YouTube](https://www.youtube.com/t/terms).

---

## 🛠️ Tecnologias

| Lib | Uso |
|-----|-----|
| React Native 0.73 | Framework mobile |
| react-native-youtube-iframe | Player do YouTube |
| react-native-track-player | Background audio + notificação |
| @react-navigation | Navegação |
| axios | Chamadas HTTP para a API |
