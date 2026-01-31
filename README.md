# GitHub Trending Digest

基于 GitHub Actions 的自动化工具：每日抓取 GitHub Trending，经 **AI 智能总结** 后推送到邮箱（后续可扩展钉钉等渠道）。

## 特性

- **零服务器**：完全跑在 GitHub Actions
- **AI 可扩展**：支持 MiniMax / Claude，架构支持轻松接入 OpenAI / DeepSeek 等
- **通知可扩展**：第一期仅邮箱，设计上支持后续加钉钉 / 企业微信 / Slack 等
- **即配即用**：Fork 后配置 Secrets 即可

## 技术栈

- **pnpm** 包管理
- **TypeScript**（源码为 TS，编译为 JS 运行）
- Node.js 18+（推荐 20+，避免 cheerio/undici 兼容性提示）
- axios、cheerio、nodemailer、@anthropic-ai/sdk

## 项目结构

```
github-trending-digest/
├── .github/workflows/daily-digest.yml
├── config/default.json
├── src/
│   ├── index.ts               # 主入口
│   ├── scraper.ts             # 抓取 Trending
│   ├── template.ts            # 邮件/文本模板
│   ├── types/index.ts         # 共享类型
│   ├── summarizers/           # AI 总结（可扩展多模型）
│   │   ├── index.ts           # 注册表：getSummarizer(provider)
│   │   ├── base.ts            # 抽象基类
│   │   ├── claude.ts          # Claude 实现
│   │   └── minimax.ts         # MiniMax 实现
│   └── notifiers/             # 通知渠道（可扩展）
│       ├── index.ts           # 注册表：getNotifiers(channels)
│       ├── base.ts            # 抽象基类
│       ├── email.ts           # 邮箱实现
│       └── dingtalk.ts        # 钉钉实现
├── dist/                      # 编译输出（pnpm run build）
├── tsconfig.json
├── .env.example
└── package.json
```

## 扩展说明

### 扩展其他 AI 模型

1. 在 `src/summarizers/` 下新建实现类，继承 `SummarizerBase`，实现 `generateSummary(projects, options)`。
2. 在 `src/summarizers/index.js` 的 `registry` 中注册，例如：`openai: new OpenAISummarizer()`。
3. 环境变量或 Variables 中设置 `SUMMARIZER_PROVIDER=openai` 及对应 API Key。

### 扩展其他通知渠道（如钉钉）

1. 在 `src/notifiers/` 下新建实现类，继承 `NotifierBase`，实现 `send(content, options)` 和 `isConfigured()`。
2. 在 `src/notifiers/index.js` 的 `registry` 中注册，例如：`dingtalk: new DingTalkNotifier()`。
3. 环境变量中设置 `NOTIFY_CHANNELS=email,dingtalk`，并配置钉钉 Webhook 等 Secrets。

## 本地与 Actions 配置

### 环境变量 / Secrets

复制 `.env.example` 为 `.env`，按需填写。Actions 中在 **Secrets and variables > Actions** 里配置：

**Secrets（必填）**

| 名称 | 说明 |
|------|------|
| `MINIMAX_API_KEY` | MiniMax API Key（使用 minimax 时） |
| `ANTHROPIC_API_KEY` | Claude API Key（使用 claude 时） |
| `EMAIL_USER` | 发件邮箱（如 163：kinghy949@163.com） |
| `EMAIL_PASS` | 邮箱 SMTP 授权码（163 需在网页端开启 SMTP 并获取授权码） |
| `RECIPIENT_EMAIL` | 收件邮箱 |

**Variables（可选）**

| 名称 | 说明 | 默认 |
|------|------|------|
| `LANGUAGE_FILTER` | 语言过滤 | 空 |
| `SINCE` | 时间范围 | daily |
| `SUMMARY_LANGUAGE` | 摘要语言 | zh-CN |
| `MAX_PROJECTS` | 最大项目数 | 10 |
| `SUMMARIZER_PROVIDER` | 总结模型 | minimax / claude |
| `NOTIFY_CHANNELS` | 通知渠道 | email |

**163 邮箱说明**：发件需在 163 邮箱设置中开启 SMTP，使用授权码（非登录密码）。本地/ Actions 需设置 `EMAIL_HOST=smtp.163.com`、`EMAIL_PORT=465`、`EMAIL_SECURE=true`（已在 .env.example 中）。

### 本地运行

```bash
# 若未安装 pnpm，可先执行：corepack enable && corepack prepare pnpm@9.14.2 --activate
pnpm install
cp .env.example .env
# 编辑 .env 后
pnpm run build
pnpm start
```

### 定时与手动触发

- 定时：见 `.github/workflows/daily-digest.yml` 中 `schedule`（默认 UTC 01:00）。
- 手动：在仓库 **Actions** 页选择 “GitHub Trending Daily Digest” → **Run workflow**。

## License

MIT
