/**
 * 总结器抽象接口
 * 新增模型时实现此接口并到 summarizers/index.js 注册即可
 */

/**
 * @typedef {Object} SummaryProject
 * @property {string} name - 项目名 owner/repo
 * @property {string} [description] - 描述
 * @property {string} [language] - 语言
 * @property {number} [stars] - Star 数
 * @property {number} [forks] - Fork 数
 * @property {string} [starsToday] - 今日新增 Star 文案
 * @property {string} [url] - 项目链接
 */

/**
 * @typedef {Object} SummaryResult
 * @property {string} highlight - 今日亮点总结
 * @property {string} [categoryOverview] - 分类概览(可选)
 * @property {Array<{name: string, oneLiner: string, category?: string, reason?: string}>} projects - 每个项目的一句话介绍与推荐理由
 */

/**
 * @typedef {Object} SummarizerOptions
 * @property {string} [language='zh-CN'] - 输出语言 zh-CN | en
 * @property {number} [maxProjects] - 参与总结的最大项目数
 */

/**
 * 总结器接口 - 所有模型实现必须提供 generateSummary(projects, options)
 * @interface
 */
export class SummarizerBase {
  /**
   * 生成摘要
   * @param {SummaryProject[]} projects - 项目列表
   * @param {SummarizerOptions} [options] - 选项
   * @returns {Promise<SummaryResult>}
   */
  async generateSummary(projects, options = {}) {
    throw new Error('子类必须实现 generateSummary(projects, options)');
  }
}
