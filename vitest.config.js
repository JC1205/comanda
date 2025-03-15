import { defineConfig } from 'vitest/config'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'

const isTest = process.env.NODE_ENV === 'test'

export default defineConfig({
  plugins: [
    vue(),
    ...(!isTest
      ? [
          electron({
            main: {
              entry: 'electron/main.ts',
            },
            preload: {
              input: path.join(__dirname, 'electron/preload.ts'),
            },
            renderer: {}
          })
        ]
      : [])
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@views': path.resolve(__dirname, 'src/views')
    }
  },
  test: {
    environment: 'jsdom'
  }
})
