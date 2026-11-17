import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Configuramos '@' para que apunte siempre a la carpeta 'src'
      '@': path.resolve(__dirname, './src'),
    },
  },
})