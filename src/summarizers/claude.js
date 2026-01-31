import Anthropic from '@anthropic-ai/sdk';
import { SummarizerBase } from './base.js';

export class ClaudeSummarizer extends SummarizerBase {
  constructor() {
    super();
    this._client = null;
  }

  get client() {
    if (!this._client) {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error('缺少环境变量 ANTHROPIC_API_KEY');
      this._client = new Anthropic({ apiKey: key });
    }
    return this._client;
  }

  /**
   * @param {import('./base.js').SummaryProject[]} projects
   * @param {import('./base.js').SummarizerOptions} options
   * @returns {Promise<import('./base.js').SummaryResult>}
   */
  async generateSummary(projects, options = {}) {
    const language = options.language || process.env.SUMMARY_LANGUAGE || 'zh-CN';
    const maxProjects = options.maxProjects || Math.min(projects.length, 15);
    const list = projects.slice(0, maxProjects);

    const langInstruction = language === 'zh-CN'
      ? '请用简体中文回答。'
      : 'Please respond in English.';

    const projectListText = list.map((p, i) => {
      const line = `${i + 1}. ${p.name} | ${p.language || '-'} | ⭐ ${p.stars ?? '-'} | ${p.description || '无描述'}`;
      return line;
    }).join('\n');

    const prompt = `你是一位技术编辑，需要根据以下 GitHub Trending 项目列表，生成一份简洁的每日摘要。

${langInstruction}

要求：
1. 先写一段「今日亮点」总结（2-4 句话），概括整体趋势（如 AI/Web/工具 等）。
2. 然后为每个项目写：一句话介绍、分类标签（如 AI/Web/工具）、简短推荐理由。
3. 输出必须为合法 JSON，便于程序解析，不要包含 markdown 代码块或多余说明。

项目列表：
${projectListText}

请直接输出一个 JSON 对象，格式如下（不要包含 \`\`\`json 等标记）：
{
  "highlight": "今日亮点总结的整段文字",
  "categoryOverview": "可选，分类概览一句话",
  "projects": [
    {
      "name": "owner/repo",
      "oneLiner": "一句话介绍",
      "category": "分类标签",
      "reason": "推荐理由"
    }
  ]
}`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content?.[0]?.type === 'text'
      ? response.content[0].text
      : '';
    const cleaned = text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/m, '$1').trim();
    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (e) {
      throw new Error('Claude 返回内容无法解析为 JSON: ' + text.slice(0, 200));
    }

    return {
      highlight: data.highlight || '',
      categoryOverview: data.categoryOverview,
      projects: Array.isArray(data.projects) ? data.projects : [],
    };
  }
}
