/**
 * 总结器抽象基类
 * 新增模型时继承此类并实现 generateSummary，再到 summarizers/index.ts 注册
 */
import type {
  SummaryProject,
  SummaryResult,
  SummarizerOptions,
} from '../types/index.js';

export abstract class SummarizerBase {
  abstract generateSummary(
    projects: SummaryProject[],
    options?: SummarizerOptions
  ): Promise<SummaryResult>;
}
