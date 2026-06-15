import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Reflex-World/' : '/',
  plugins: [react()],
  server: {
    port: 3236,
    host: true,
  },
  preview: {
    port: 3236,
    host: true,
  },
}))
