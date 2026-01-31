/**
 * AI 总结模块 - 可扩展多模型
 * 新增模型只需在此注册，并在 config / 环境变量中指定 SUMMARIZER_PROVIDER
 */
import { ClaudeSummarizer } from './claude.js';

const registry = {
  claude: new ClaudeSummarizer(),
  // 后续扩展示例:
  // openai: new OpenAISummarizer(),
  // deepseek: new DeepSeekSummarizer(),
};

/**
 * 获取指定 provider 的总结器
 * @param {string} provider - 如 'claude' | 'openai'
 * @returns {import('./base.js').Summarizer}
 */
export function getSummarizer(provider = 'claude') {
  const summarizer = registry[provider];
  if (!summarizer) {
    throw new Error(`不支持的总结模型: ${provider}，可选: ${Object.keys(registry).join(', ')}`);
  }
  return summarizer;
}

export { registry };
