import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // FFmpeg WASM 파일을 위한 CORS 헤더
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      // SharedArrayBuffer 지원을 위한 헤더
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
  optimizeDeps: {
    // FFmpeg 관련 의존성 최적화
    include: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  build: {
    // WASM 파일을 위한 빌드 최적화
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.wasm')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
})
