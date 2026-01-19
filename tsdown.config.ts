import { defineConfig } from 'tsdown'

export default defineConfig({
  platform: 'node',
  external: ['vite'],
  entry: {
    index: 'src/index.ts',
    vcap: 'src/vcap.ts',
  },
})
