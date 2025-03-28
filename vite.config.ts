import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base : "/dist/",
  build: {
    rollupOptions: {
        treeshake: true, // 사용되지 않는 코드 제거 강제 적용
    },
},
})
