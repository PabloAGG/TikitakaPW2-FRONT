import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'/',
  server: {
    // Añade esta sección
    allowedHosts: [
      // Permite cualquier subdominio de ngrok-free.app
      '.ngrok-free.app' 
    ]
  }
})
