import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows access from different network devices
    port: 5173, // Ensures consistency
  },
  build: {
    outDir: 'dist', // Ensures the build output directory is correct
  },
  resolve: {
    alias: {
      '@': '/src', // Optional: Allows `@` as a shortcut for `/src`
    },
  },
  base: '/', // Ensures correct base path
  define: {
    'process.env': {}, // Helps avoid environment variable issues
  },
})