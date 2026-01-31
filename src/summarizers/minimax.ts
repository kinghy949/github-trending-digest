/**
 * MiniMax 总结器 - 通过 Anthropic 兼容接口调用
 * 文档: https://platform.minimaxi.com/docs/api-reference/text-anthropic-api
 */
import Anthropic from '@anthropic-ai/sdk';
import { SummarizerBase } from './base.js';
import type {
  SummaryProject,
  SummaryResult,
  SummarizerOptions,
} from '../types/index.js';

const MINIMAX_BASE_URL = 'https://api.minimaxi.com/anthropic';
const DEFAULT_MODEL = 'MiniMax-M2.1';

export class MiniMaxSummarizer extends SummarizerBase {
  private _client: Anthropic | null = null;

  get client(): Anthropic {
    if (!this._client) {
      const key = process.env.MINIMAX_API_KEY;
      if (!key) throw new Error('缺少环境变量 MINIMAX_API_KEY');
      this._client = new Anthropic({
        apiKey: key,
        baseURL: process.env.MINIMAX_BASE_URL || MINIMAX_BASE_URL,
      });
    }
    return this._client;
  }

  async generateSummary(
    projects: SummaryProject[],
    options: SummarizerOptions = {}
  ): Promise<SummaryResult> {
    const language = options.language || process.env.SUMMARY_LANGUAGE || 'zh-CN';
    const maxProjects = options.maxProjects ?? Math.min(projects.length, 15);
    const list = projects.slice(0, maxProjects);
    const model = process.env.MINIMAX_MODEL || DEFAULT_MODEL;

    const langInstruction =
      language === 'zh-CN' ? '请用简体中文回答。' : 'Please respond in English.';

    const projectListText = list
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} | ${p.language || '-'} | ⭐ ${p.stars ?? '-'} | ${p.description || '无描述'}`
      )
      .join('\n');

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
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content;
    const textBlock = Array.isArray(content)
      ? content.find((b): b is { type: 'text'; text: string } => b.type === 'text')
      : null;
    const text = textBlock?.text ?? '';
    const cleaned = text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/m, '$1').trim();
    let data: { highlight?: string; categoryOverview?: string; projects?: SummaryResult['projects'] };
    try {
      data = JSON.parse(cleaned) as typeof data;
    } catch {
      throw new Error('MiniMax 返回内容无法解析为 JSON: ' + text.slice(0, 200));
    }

    return {
      highlight: data.highlight ?? '',
      categoryOverview: data.categoryOverview,
      projects: Array.isArray(data.projects) ? data.projects : [],
    };
  }
}
