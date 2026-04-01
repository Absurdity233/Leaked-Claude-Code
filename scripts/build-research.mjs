import { build } from 'esbuild'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const stubDir = path.join(rootDir, 'research-stubs')
const outFile = path.join(rootDir, 'dist', 'research', 'cli.cjs')

const version = process.env.CLAUDE_CODE_RESEARCH_VERSION || '0.0.0-research'
const buildTime = new Date().toISOString()

const macroValues = {
  VERSION: version,
  BUILD_TIME: buildTime,
  FEEDBACK_CHANNEL: 'research',
  ISSUES_EXPLAINER:
    'This is a community research build reconstructed from a public source snapshot.',
  NATIVE_PACKAGE_URL: '',
  PACKAGE_URL: '',
  VERSION_CHANGELOG: 'research-snapshot',
}

const stubMap = new Map([
  ['bun:bundle', path.join(stubDir, 'bun-bundle.js')],
  ['@ant/claude-for-chrome-mcp', path.join(stubDir, 'claude-for-chrome-mcp.cjs')],
  ['@alcalzone/ansi-tokenize', path.join(stubDir, 'ansi-tokenize.js')],
  ['@ant/computer-use-mcp/types', path.join(stubDir, 'computer-use-mcp-types.cjs')],
  ['@ant/computer-use-mcp/sentinelApps', path.join(stubDir, 'computer-use-mcp-sentinel.cjs')],
  ['@anthropic-ai/sandbox-runtime', path.join(stubDir, 'sandbox-runtime.cjs')],
  ['jsonc-parser/lib/esm/main.js', path.join(stubDir, 'jsonc-parser-main.js')],
  ['audio-capture.node', path.join(stubDir, 'private-proxy.cjs')],
  ['color-diff-napi', path.join(stubDir, 'private-proxy.cjs')],
  ['modifiers-napi', path.join(stubDir, 'private-proxy.cjs')],
])

const stubPrefixes = [
  '@ant/',
  '@anthropic-ai/claude-agent-sdk',
  '@anthropic-ai/mcpb',
]

function resolveProjectPath(importPath) {
  const normalized = importPath.replace(/\\/g, '/')
  const absolute = path.join(rootDir, normalized)
  const candidates = [
    absolute,
    absolute.replace(/\.js$/i, '.ts'),
    absolute.replace(/\.js$/i, '.tsx'),
    absolute.replace(/\.mjs$/i, '.ts'),
    absolute.replace(/\.mjs$/i, '.tsx'),
    absolute.replace(/\.cjs$/i, '.ts'),
    absolute.replace(/\.cjs$/i, '.tsx'),
    `${absolute}.ts`,
    `${absolute}.tsx`,
    `${absolute}.js`,
    `${absolute}.jsx`,
    path.join(absolute, 'index.ts'),
    path.join(absolute, 'index.tsx'),
    path.join(absolute, 'index.js'),
    path.join(absolute, 'index.jsx'),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

function resolveRelativeProjectPath(importPath, importer) {
  const baseDir = path.dirname(importer)
  const absolute = path.resolve(baseDir, importPath)
  const candidates = [
    absolute,
    absolute.replace(/\.js$/i, '.ts'),
    absolute.replace(/\.js$/i, '.tsx'),
    absolute.replace(/\.mjs$/i, '.ts'),
    absolute.replace(/\.mjs$/i, '.tsx'),
    `${absolute}.ts`,
    `${absolute}.tsx`,
    `${absolute}.js`,
    `${absolute}.jsx`,
    path.join(absolute, 'index.ts'),
    path.join(absolute, 'index.tsx'),
    path.join(absolute, 'index.js'),
    path.join(absolute, 'index.jsx'),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

function applyResearchTransforms(source) {
  return source
    .replace(/^\/\/# sourceMappingURL=.*$/gm, '')
    .replace(/fileURLToPath\(import\.meta\.url\)/g, 'process.cwd()')
    .replace(/'-d2e, --debug-to-stderr'/g, "'--debug-to-stderr'")
    .replace(/feature\('([A-Z0-9_]+)'\)/g, 'false')
    .replace(/process\.env\.USER_TYPE === 'ant'/g, 'false')
    .replace(/process\.env\.USER_TYPE !== 'ant'/g, 'true')
}

const researchPlugin = {
  name: 'research-build',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /^src\// }, args => ({
      path:
        resolveProjectPath(args.path) ??
        path.join(stubDir, 'private-proxy.cjs'),
    }))

    pluginBuild.onResolve({ filter: /.*/ }, args => {
      const stubPath = stubMap.get(args.path)
      if (stubPath) {
        return { path: stubPath }
      }

      for (const prefix of stubPrefixes) {
        if (args.path.startsWith(prefix)) {
          return { path: path.join(stubDir, 'private-proxy.cjs') }
        }
      }

      if (args.path.startsWith('.')) {
        const resolved = resolveRelativeProjectPath(args.path, args.importer)
        if (resolved) {
          return { path: resolved }
        }
        if (args.importer.startsWith(path.join(rootDir, 'src'))) {
          return { path: path.join(stubDir, 'private-proxy.cjs') }
        }
        return null
      }

      if (
        !args.path.startsWith('/') &&
        !args.path.startsWith('node:') &&
        !path.isAbsolute(args.path)
      ) {
        return { path: args.path, external: true }
      }

      return null
    })

    pluginBuild.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async args => {
      if (!args.path.startsWith(path.join(rootDir, 'src'))) {
        return null
      }

      const { readFile } = await import('fs/promises')
      const contents = await readFile(args.path, 'utf8')
      const transformed = applyResearchTransforms(contents)
      const extension = path.extname(args.path).toLowerCase()
      const loader =
        extension === '.tsx'
          ? 'tsx'
          : extension === '.ts'
            ? 'ts'
            : extension === '.jsx'
              ? 'jsx'
              : 'js'

      return {
        contents: transformed,
        loader,
      }
    })
  },
}

await build({
  absWorkingDir: rootDir,
  entryPoints: ['src/entrypoints/cli.tsx'],
  outfile: outFile,
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: ['node22'],
  sourcemap: true,
  logLevel: 'info',
  mainFields: ['module', 'main'],
  conditions: ['node', 'default'],
  plugins: [researchPlugin],
  define: {
    'process.env.USER_TYPE': JSON.stringify('external'),
    'MACRO.VERSION': JSON.stringify(macroValues.VERSION),
    'MACRO.BUILD_TIME': JSON.stringify(macroValues.BUILD_TIME),
    'MACRO.FEEDBACK_CHANNEL': JSON.stringify(macroValues.FEEDBACK_CHANNEL),
    'MACRO.ISSUES_EXPLAINER': JSON.stringify(macroValues.ISSUES_EXPLAINER),
    'MACRO.NATIVE_PACKAGE_URL': JSON.stringify(macroValues.NATIVE_PACKAGE_URL),
    'MACRO.PACKAGE_URL': JSON.stringify(macroValues.PACKAGE_URL),
    'MACRO.VERSION_CHANGELOG': JSON.stringify(macroValues.VERSION_CHANGELOG),
  },
})
