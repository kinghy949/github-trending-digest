/**
 * 共享类型定义
 */

/** 抓取到的 Trending 项目 */
export interface TrendingProject {
  name: string;
  description: string;
  stars: number;
  forks: number;
  starsToday: string;
  language: string;
  url: string;
}

/** 总结器输入项目（与 TrendingProject 兼容，字段可选） */
export interface SummaryProject {
  name: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  starsToday?: string;
  url?: string;
}

/** 总结结果中的单个项目 */
export interface SummaryProjectItem {
  name: string;
  oneLiner: string;
  category?: string;
  reason?: string;
}

/** 总结器输出 */
export interface SummaryResult {
  highlight: string;
  categoryOverview?: string;
  projects: SummaryProjectItem[];
}

/** 总结器选项 */
export interface SummarizerOptions {
  language?: string;
  maxProjects?: number;
}

/** 总结器接口 */
export interface Summarizer {
  generateSummary(projects: SummaryProject[], options?: SummarizerOptions): Promise<SummaryResult>;
}

/** 通知内容 */
export interface NotifyContent {
  subject?: string;
  html?: string;
  text?: string;
  summary?: unknown;
}

/** 通知选项 */
export interface NotifyOptions {
  recipient?: string;
  channelConfig?: Record<string, unknown>;
}

/** 通知器接口 */
export interface Notifier {
  isConfigured(): boolean;
  send(content: NotifyContent, options?: NotifyOptions): Promise<void>;
}

/** 邮件模板 / 文本摘要的 payload */
export interface TemplatePayload {
  highlight: string;
  categoryOverview?: string;
  projects: SummaryProjectItem[];
  rawProjects?: TrendingProject[];
  date?: string;
}
