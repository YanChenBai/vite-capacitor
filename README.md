# vite-capacitor

[![npm version](https://img.shields.io/npm/v/vite-capacitor.svg)](https://www.npmjs.com/package/vite-capacitor)
[![license](https://img.shields.io/github/license/author/library.svg)](./LICENSE)

🚀 **自动同步 Vite 开发服务器环境到 Capacitor 配置。**

在进行 Capacitor 真机调试时，手动查找本机局域网 IP 并修改 `server.url` 非常繁琐。本插件通过自动化这一过程，实现了“启动即调试”的移动端开发体验。

---

## 📦 安装

```bash
# 使用 pnpm
pnpm add vite-capacitor -D

# 使用 npm
npm install vite-capacitor -D
```

---

## 🛠️ 快速配置

### 1. 配置 Vite 插件

在 `vite.config.ts` 中引入并使用插件。

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { viteCapacitor } from 'vite-capacitor'

export default defineConfig({
  plugins: [
    viteCapacitor()
  ],
  // 插件扩展了类型，你可以在这里定义 Capacitor 基础属性
  capacitor: {
    appId: 'com.example.app',
    appName: 'MyCapApp',
  },
  server: {
    host: true, // 必须开启 host
  }
})
```

### 2. Capacitor 配置

修改项目根目录的 `capacitor.config.ts`，调用 `loadConfig` 来动态加载生成的配置。

```typescript
// capacitor.config.ts
import { loadConfig } from 'vite-capacitor'

export default loadConfig()
```

### 3. 更新 .gitignore

插件生成的临时配置文件建议不要提交到仓库。

```ignore
# .gitignore
.capacitor/

```

## 📖 使用案例 (Usage Example)

### 场景 A：真机实时调试 (Development)

1. **执行启动**: 运行 `npm run dev`。
* 插件检测到你的电脑 IP 是 `192.168.1.50`，Vite 端口是 `5173`。
* 插件自动在 `.capacitor/config.dev.json` 中生成包含 `http://192.168.1.50:5173` 的配置。

2. **运行 App**: 运行 `npx cap run ios` 或 `npx cap run android`。
* **效果**: 手机 App 启动后会自动连接到你电脑上的 Vite 服务。当你修改代码并保存时，手机屏幕会**立即同步更新 (HMR)**。

### 场景 B：构建发布 (Production)

1. **执行构建**: 运行 `npm run build`。
* 插件识别到 Vite 的构建输出目录为 `dist`。
* 插件自动在 `.capacitor/config.prod.json` 中将 `webDir` 设置为 `dist`。

2. **同步资源**: 运行 `npx cap copy`。
* **效果**: Capacitor 会自动将编译好的 `dist` 静态资源拷贝到原生工程中，确保 App 在离线状态下也能正常运行。

## 📂 项目结构

```text
.
├── .capacitor/             # 插件生成的临时配置目录
│   ├── config.dev.json     # 开发环境配置 (含动态 IP URL)
│   └── config.prod.json    # 生产环境配置 (含 webDir)
├── vite.config.ts          # 配置 Capacitor 基础属性
└── capacitor.config.ts     # 动态消费生成的配置
