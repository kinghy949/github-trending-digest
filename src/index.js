/**
 * GitHub Trending Digest - 主入口
 * 抓取 Trending → AI 总结(可扩展多模型) → 多渠道通知(第一期邮箱，可扩展钉钉等)
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { fetchTrending } from './scraper.js';
import { getSummarizer } from './summarizers/index.js';
import { getNotifiers } from './notifiers/index.js';
import { generateEmailTemplate, generateTextSummary } from './template.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  const configPath = join(__dirname, '..', 'config', 'default.json');
  let base = {};
  if (existsSync(configPath)) {
    base = JSON.parse(readFileSync(configPath, 'utf-8'));
  }
  return {
    language: process.env.LANGUAGE_FILTER || (base.scraper && base.scraper.language) || '',
    since: process.env.SINCE || (base.scraper && base.scraper.since) || 'daily',
    maxProjects: parseInt(process.env.MAX_PROJECTS || (base.scraper && base.scraper.maxProjects) || '10', 10),
    summarizerProvider: process.env.SUMMARIZER_PROVIDER || (base.summarizer && base.summarizer.provider) || 'claude',
    summaryLanguage: process.env.SUMMARY_LANGUAGE || (base.summarizer && base.summarizer.language) || 'zh-CN',
    notifyChannels: process.env.NOTIFY_CHANNELS || (base.notifier && base.notifier.channels && base.notifier.channels.join(',')) || 'email',
  };
}

async function main() {
  const config = loadConfig();
  console.log('配置:', config);

  console.log('抓取 GitHub Trending...');
  const projects = await fetchTrending(config.language, config.since, config.maxProjects);
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
    date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
  };

  const content = {
    subject: `GitHub Trending Daily Digest - ${payload.date}`,
    html: generateEmailTemplate(payload),
    text: generateTextSummary(payload),
    summary: payload,
  };

  const notifiers = getNotifiers(config.notifyChannels.split(',').map(s => s.trim()));
  if (!notifiers.length) {
    console.warn('没有已配置的通知渠道，请设置 NOTIFY_CHANNELS 及对应环境变量');
    return;
  }

  for (const notifier of notifiers) {
    try {
      await notifier.send(content);
      console.log('通知发送成功:', notifier.constructor?.name || 'unknown');
    } catch (err) {
      console.error('通知发送失败:', err.message);
      throw err;
    }
  }
  console.log('全部完成');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
