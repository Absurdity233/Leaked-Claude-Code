# Claude Code — 泄露源代码 (2026-03-31)
---

## 来自哪里

[Chaofan Shou (@Fried_rice)] discovered the leak and posted it publicly:

> "Claude code source code has been leaked via a map file in their npm registry!"
> 
> — [@Fried_rice, March 31, 2026]

## 我做了什么

补了研究版工程骨架： package.json tsconfig.json
写了 Node 版构建脚本： build-research.mjs 这个脚本会把这份源码快照编成可运行的研究版 CLI，主要做了：
用 esbuild 代替原本缺失的 Bun 构建环境
把 feature('...') 默认裁成 false
把 USER_TYPE 固定成外部社区路径
给 MACRO.VERSION 这类构建期常量补值
兼容了一些 Node 下会炸的点，比如 import.meta.url 和一个 Commander 参数格式问题
加了私有依赖和 Bun 能力的 stub： bun-bundle.js private-proxy.cjs ansi-tokenize.js jsonc-parser-main.js sandbox-runtime.cjs

## 此项目只用于研究
