import type { CapacitorConfig } from '@capacitor/cli'
import 'vite'

export {}

declare module 'vite' {
  interface UserConfig {
    capacitor?: CapacitorConfig
  }
}
