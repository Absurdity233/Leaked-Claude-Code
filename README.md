# Claude Code — 源代码研究项目 (2026-03-31)

---

## 项目背景

该泄露由 **Chaofan Shou (@Fried_rice)** 发现并公开：

> "Claude code source code has been leaked via a map file in their npm registry!"
> 
> — *[@Fried_rice, March 31, 2026]*

---

## 核心修复与工作内容

为了使该源码快照能够正常运行，本项目补全了**研究版工程骨架**并开发了配套构建工具。主要工作如下：

### 1. 工程初始化
* **补全骨架文件：** 补充了缺失的 `package.json` 和 `tsconfig.json`。
* **Node.js 构建脚本：** 编写了 `build-research.mjs`，用于将源码编译为可运行的 CLI 程序的自动化脚本。

### 2. 构建逻辑适配 (Build Logic)
* **编译器迁移：** 引入 `esbuild` 代替了原本缺失的 Bun 构建环境。
* **特性裁剪：** 将 `feature('...')` 开关默认裁剪为 `false`。
* **常量注入：** * 将 `USER_TYPE` 固定为外部社区路径。
    * 为 `MACRO.VERSION` 等构建期常量提供了补丁值。

### 3. 环境兼容性修复
* **运行时兼容：** 解决了 Node.js 环境下 `import.meta.url` 的报错问题。
* **参数解析修复：** 修正了一个导致 `Commander` 库崩溃的参数格式问题。

### 4. 依赖与功能桩 (Stubs)
针对私有依赖和 Bun 特有能力实现了 Stub 兼容层：
* `bun-bundle.js` / `sandbox-runtime.cjs`
* `private-proxy.cjs`
* `ansi-tokenize.js`
* `jsonc-parser-main.js`

---

## 免责声明

> [!IMPORTANT]
> **此项目仅用于安全研究与学习。** 请使用者自觉遵守相关法律法规，尊重原作者知识产权。
