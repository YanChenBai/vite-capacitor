# vite-capacitor

**vite-capacitor** 是一个零配置的 Capacitor 增强工具，它能自动将你的 Vite 运行环境（开发服务器 IP 或构建目录）同步到原生工程中。

## ✨ 为什么使用它？

Capacitor 开发需要手动修改 `capacitor.config.ts` 中的 `server.url` 来进行真机调试。**vite-capacitor** 将这一过程自动化：

* **开发模式**：自动获取本机局域网 IP，配置 HMR 地址。
* **生产模式**：自动指向构建后的 `dist` 目录。

---

## 🚀 快速上手

### 1. 安装

```bash
npm install vite-capacitor -D

```

### 2. 配置 Capacitor

在 `capacitor.config.ts` 中引入 `loadConfig`。它会根据执行环境自动注入配置。

```typescript
// capacitor.config.ts
import { loadConfig } from 'vite-capacitor'

export default loadConfig()
```

### 3. 使用 `npx vcap sync` 替代 `npx cap sync`

不再直接使用原生命令，改用 `vcap`：

```bash
# 真机热更新调试 (Development)
# 自动探测 IP -> 生成配置 -> 执行 cap sync
npx vcap sync android

# 准备发布包 (Production)
# 自动设置 webDir: dist -> 执行 cap sync
npx vcap sync android --build

```

---

## 🛠️ CLI 命令详解

`vcap sync [platform] [options]`

| 选项 | 描述 | 默认值 |
| --- | --- | --- |
| `platform` | 目标平台: `android` 或 `ios` | - |
| `--build` | **重要**：指定为生产模式。不加则默认为开发模式。 | `false` |
| `--deployment` | (iOS) `pod install` 使用 `--deployment`。 | `false` |
| `--inline` | (Android) 将 Source Maps 内联到 Webview 中。 | `false` |

## 📄 建议配置

将 `.capacitor` 目录加入忽略列表，因为它包含的是本地环境相关的动态配置：

```ignore
// .gitignore
.capacitor/

```
