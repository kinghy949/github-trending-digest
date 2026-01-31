/**
 * GitHub Trending Digest - 主入口
 * 抓取 Trending → AI 总结(可扩展多模型) → 多渠道通知(第一期邮箱，可扩展钉钉等)
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { fetchTrending } from './scraper.js';
import { getSummarizer } from './summarizers/index.js';
import { getNotifiers } from './notifiers/index.js';
import { generateEmailTemplate, generateTextSummary } from './template.js';
import type { TrendingProject } from './types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
// 本地运行时从项目根目录加载 .env；GitHub Actions 使用 Secrets，不依赖 .env
const envPath = join(projectRoot, '.env');
config({ path: envPath });

interface ConfigFile {
  scraper?: { language?: string; since?: string; maxProjects?: number };
  summarizer?: { provider?: string; language?: string };
  notifier?: { channels?: string[] };
}

interface AppConfig {
  language: string;
  since: string;
  maxProjects: number;
  summarizerProvider: string;
  summaryLanguage: string;
  notifyChannels: string;
}

function loadConfig(): AppConfig {
  const configPath = join(__dirname, '..', 'config', 'default.json');
  let base: ConfigFile = {};
  if (existsSync(configPath)) {
    base = JSON.parse(readFileSync(configPath, 'utf-8')) as ConfigFile;
  }
  return {
    language: process.env.LANGUAGE_FILTER || base.scraper?.language || '',
    since: process.env.SINCE || base.scraper?.since || 'daily',
    maxProjects: parseInt(
      process.env.MAX_PROJECTS || String(base.scraper?.maxProjects ?? 10),
      10
    ),
    summarizerProvider:
      process.env.SUMMARIZER_PROVIDER || base.summarizer?.provider || 'claude',
    summaryLanguage:
      process.env.SUMMARY_LANGUAGE || base.summarizer?.language || 'zh-CN',
    notifyChannels:
      process.env.NOTIFY_CHANNELS ||
      (base.notifier?.channels && base.notifier.channels.join(',')) ||
      'email',
  };
}

function ensureEnvForProvider(provider: string): void {
  if (provider === 'minimax' && !process.env.MINIMAX_API_KEY) {
    console.error('缺少环境变量 MINIMAX_API_KEY。');
    console.error('请复制 .env.example 为 .env，在项目根目录填写 MINIMAX_API_KEY 后重试。');
    console.error('  .env 应放在:', projectRoot);
    process.exit(1);
  }
  if (provider === 'claude' && !process.env.ANTHROPIC_API_KEY) {
    console.error('缺少环境变量 ANTHROPIC_API_KEY。');
    console.error('请复制 .env.example 为 .env，填写 ANTHROPIC_API_KEY 后重试。');
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const config = loadConfig();
  ensureEnvForProvider(config.summarizerProvider);
  console.log('配置:', config);

  console.log('抓取 GitHub Trending...');
  const projects: TrendingProject[] = await fetchTrending(
    config.language,
    config.since,
    config.maxProjects
  );
  if (!projects.length) {
    console.warn('未抓取到项目，退出');
    return;
  }
  console.log(`抓取到 ${projects.length} 个项目`);

  console.log(`使用总结模型: ${config.summarizerProvider}`);
  const summarizer = getSummarizer(config.summarizerProvider);
  const summary = await summarizer.generateSummary(projects, {
    language: config.summaryLanguage,
    maxProjects: config.maxProjects,
  });
  console.log('摘要生成完成');

  const payload = {
    ...summary,
    rawProjects: projects,
    date: new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  const content = {
    subject: `GitHub Trending Daily Digest - ${payload.date}`,
    html: generateEmailTemplate(payload),
    text: generateTextSummary(payload),
    summary: payload,
  };

  const notifiers = getNotifiers(config.notifyChannels.split(',').map((s) => s.trim()));
  if (!notifiers.length) {
    console.warn('没有已配置的通知渠道，请设置 NOTIFY_CHANNELS 及对应环境变量');
    return;
  }

  for (const notifier of notifiers) {
    try {
      await notifier.send(content);
      console.log('通知发送成功:', notifier.constructor?.name || 'unknown');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('通知发送失败:', message);
      throw err;
    }
  }
  console.log('全部完成');
}

main().catch((err: unknown) => {
  const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
  if (code === 'ECONNABORTED') {
    console.error('请求 GitHub 超时。请检查网络或代理，国内可尝试配置代理。');
    console.error('可在 .env 中设置 SCRAPER_TIMEOUT_MS=90000 增加超时时间（毫秒）。');
  }
  console.error(err);
  process.exit(1);
});
