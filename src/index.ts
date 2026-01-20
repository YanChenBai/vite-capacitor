import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { loadConfigFromFile } from 'vite'

const CAP_STORAGE_DIR = path.resolve(process.cwd(), '.capacitor')
const CAP_DEV_JSON_FILE_PATH = path.join(CAP_STORAGE_DIR, 'config.dev.json')
const CAP_PROD_JSON_FILE_PATH = path.join(CAP_STORAGE_DIR, 'config.prod.json')

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

function writeConfigFile(filePath: string, config: object) {
  const dir = path.dirname(filePath)

  if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true })

  fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
}

async function writeDevConfig() {
  const result = await loadConfigFromFile({ mode: 'development', command: 'serve' })
  const port = result?.config.server?.port ?? 5173
  const capConfig = result?.config.capacitor ?? {}

  writeConfigFile(CAP_DEV_JSON_FILE_PATH, {
    ...capConfig,
    server: {
      url: `http://${getNetworkIP()}:${port}`,
      ...capConfig?.server,
    },
  })
}

async function writeProdConfig() {
  const result = await loadConfigFromFile({ mode: 'production', command: 'build' })
  const viteConfig = result?.config

  writeConfigFile(CAP_PROD_JSON_FILE_PATH, {
    webDir: viteConfig?.build?.outDir ?? 'dist',
    ...viteConfig?.capacitor,
  })
}

export async function updateConfig(build = false) {
  if (build)
    await writeDevConfig()
  else
    await writeProdConfig()
}

export function loadConfig() {
  const targetFile = isDev() ? CAP_DEV_JSON_FILE_PATH : CAP_PROD_JSON_FILE_PATH

  if (!fs.existsSync(targetFile)) {
    console.warn(`[vite-capacitor] Config file not found: ${targetFile}. Using fallback.`)
    return { webDir: 'dist' }
  }

  return JSON.parse(fs.readFileSync(targetFile, 'utf-8'))
}
