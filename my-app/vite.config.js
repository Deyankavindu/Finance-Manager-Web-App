import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Finance-Manager-Web-App/',
  build: {
    outDir: 'dist',
  },
  server: {
    historyApiFallback: true,
  }
})
