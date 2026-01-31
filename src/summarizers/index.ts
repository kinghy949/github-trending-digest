/**
 * AI 总结模块 - 可扩展多模型
 * 新增模型只需在此注册，并在 config / 环境变量中指定 SUMMARIZER_PROVIDER
 */
import { ClaudeSummarizer } from './claude.js';
import { MiniMaxSummarizer } from './minimax.js';
import type { Summarizer } from '../types/index.js';

const registry: Record<string, Summarizer> = {
  claude: new ClaudeSummarizer(),
  minimax: new MiniMaxSummarizer(),
};

export function getSummarizer(provider = 'claude'): Summarizer {
  const summarizer = registry[provider];
  if (!summarizer) {
    throw new Error(
      `不支持的总结模型: ${provider}，可选: ${Object.keys(registry).join(', ')}`
    );
  }
  return summarizer;
}

export { registry };
