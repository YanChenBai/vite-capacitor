import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { loadConfigFromFile } from 'vite'

const CAP_STORAGE_DIR = path.resolve(process.cwd(), '.capacitor')
const CAP_DEV_JSON = path.join(CAP_STORAGE_DIR, 'config.dev.json')
const CAP_PROD_JSON = path.join(CAP_STORAGE_DIR, 'config.prod.json')

function isDev() {
  return process.env.NODE_ENV?.trim() === 'development'
}

function getNetworkIP() {
  const interfaces = os.networkInterfaces()
  const allIPv4 = Object.values(interfaces)
    .flat()
    .filter((iface): iface is os.NetworkInterfaceInfo =>
      !!iface && iface.family === 'IPv4' && !iface.internal,
    )

  // 优先匹配 192, 10, 172 网段
  const physicalIP = allIPv4.find(i =>
    /^(?:192\.168\.|10\.|172\.)/.test(i.address),
  )

  if (physicalIP)
    return physicalIP.address

  // 排除虚拟网关 (Clash/VPN)
  return allIPv4.find(i => !i.address.startsWith('198.18.'))?.address || 'localhost'
}

async function updateDevConfig() {
  const result = await loadConfigFromFile({ mode: 'development', command: 'serve' })
  const port = result?.config.server?.port ?? 5173
  const baseCapConfig = result?.config.capacitor ?? {}

  const devConfig = {
    ...baseCapConfig,
    server: {
      url: `http://${getNetworkIP()}:${port}`,
      ...baseCapConfig?.server,
    },
  }

  fs.writeFileSync(CAP_DEV_JSON, JSON.stringify(devConfig, null, 2))
}

async function updateProdConfig() {
  const result = await loadConfigFromFile({ mode: 'production', command: 'build' })
  const viteConfig = result?.config

  const prodConfig = {
    webDir: viteConfig?.build?.outDir ?? 'dist',
    ...viteConfig?.capacitor,
  }

  fs.writeFileSync(CAP_PROD_JSON, JSON.stringify(prodConfig, null, 2))
}

export async function updateConfig(build = false) {
  if (build)
    await updateProdConfig()
  else
    await updateDevConfig()
}

export function loadConfig() {
  const targetFile = isDev() ? CAP_DEV_JSON : CAP_PROD_JSON

  if (!fs.existsSync(targetFile)) {
    console.warn(`[vite-capacitor] Config file not found: ${targetFile}. Using fallback.`)
    return { webDir: 'dist' }
  }

  return JSON.parse(fs.readFileSync(targetFile, 'utf-8'))
}
