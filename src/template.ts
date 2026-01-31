/**
 * 邮件 HTML 模板 - 响应式、项目卡片、Star 数据
 */
import type { TemplatePayload, TrendingProject } from './types/index.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateEmailTemplate(data: TemplatePayload): string {
  const date =
    data.date ||
    new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  const rawMap = (data.rawProjects || []).reduce<Record<string, TrendingProject>>(
    (acc, p) => {
      acc[p.name] = p;
      return acc;
    },
    {}
  );

  const cards = (data.projects || [])
    .map((p, i) => {
      const raw = rawMap[p.name] ?? {};
      const url = raw.url || `https://github.com/${p.name}`;
      const stars = raw.stars != null ? raw.stars.toLocaleString() : '-';
      const starsToday = raw.starsToday ? ` (↗️ ${raw.starsToday})` : '';
      const lang = raw.language || p.category || '-';
      const oneLiner = p.oneLiner || p.reason || '';
      const reason =
        p.reason && p.reason !== oneLiner ? `<p class="reason">${escapeHtml(p.reason)}</p>` : '';
      return `
    <div class="card">
      <div class="card-index">${i + 1}</div>
      <div class="card-body">
        <h3 class="card-title"><a href="${escapeHtml(url)}">${escapeHtml(p.name)}</a> <span class="stars">⭐ ${stars}${escapeHtml(starsToday)}</span></h3>
        <p class="meta">🏷️ ${escapeHtml(lang)}</p>
        <p class="desc">${escapeHtml(oneLiner)}</p>
        ${reason}
        <a href="${escapeHtml(url)}" class="link">查看项目 →</a>
      </div>
    </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Trending Daily Digest</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #24292e 0%, #2f363d 100%); color: #fff; padding: 24px; }
    .header h1 { margin: 0 0 8px 0; font-size: 22px; }
    .header .date { opacity: 0.9; font-size: 14px; }
    .section { padding: 20px 24px; border-bottom: 1px solid #eee; }
    .section:last-of-type { border-bottom: none; }
    .section h2 { margin: 0 0 12px 0; font-size: 16px; color: #24292e; }
    .highlight { line-height: 1.6; color: #444; font-size: 14px; }
    .card { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
    .card:last-child { border-bottom: none; }
    .card-index { flex-shrink: 0; width: 28px; height: 28px; background: #0366d6; color: #fff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; }
    .card-body { flex: 1; min-width: 0; }
    .card-title { margin: 0 0 6px 0; font-size: 15px; }
    .card-title a { color: #0366d6; text-decoration: none; }
    .card-title a:hover { text-decoration: underline; }
    .stars { font-size: 13px; color: #586069; font-weight: normal; }
    .meta { margin: 0 0 6px 0; font-size: 12px; color: #586069; }
    .desc { margin: 0 0 6px 0; font-size: 14px; line-height: 1.5; }
    .reason { margin: 0 0 8px 0; font-size: 13px; color: #666; }
    .link { font-size: 13px; color: #0366d6; text-decoration: none; }
    .link:hover { text-decoration: underline; }
    .footer { padding: 16px 24px; font-size: 12px; color: #586069; text-align: center; background: #fafafa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 GitHub Trending Daily Digest</h1>
      <div class="date">📅 ${escapeHtml(date)}</div>
    </div>
    <div class="section">
      <h2>🔥 今日亮点</h2>
      <div class="highlight">${escapeHtml(data.highlight || '暂无')}</div>
      ${data.categoryOverview ? `<p class="meta">${escapeHtml(data.categoryOverview)}</p>` : ''}
    </div>
    <div class="section">
      <h2>🏆 今日 Top 项目</h2>
      ${cards || '<p>暂无项目</p>'}
    </div>
    <div class="footer">
      由 GitHub Actions 自动生成 · GitHub Trending Digest
    </div>
  </div>
</body>
</html>`;
}

export function generateTextSummary(data: TemplatePayload): string {
  const date =
    data.date ||
    new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  let text = `📧 GitHub Trending Daily Digest\n📅 ${date}\n\n🔥 今日亮点\n${data.highlight || '暂无'}\n\n`;
  (data.projects || []).forEach((p, i) => {
    const raw = (data.rawProjects || []).find((r) => r.name === p.name);
    const url = raw?.url || `https://github.com/${p.name}`;
    text += `${i + 1}. ${p.name} ${raw?.starsToday ? raw.starsToday : ''}\n   ${p.oneLiner || ''}\n   ${url}\n\n`;
  });
  return text;
}
