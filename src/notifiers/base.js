/**
 * 通知渠道抽象接口
 * 第一期仅实现 email，后续扩展钉钉/企业微信/Slack 等只需实现此接口并注册
 */

/**
 * @typedef {Object} NotifyContent
 * @property {string} [subject] - 标题(邮件等)
 * @property {string} [html] - HTML 内容
 * @property {string} [text] - 纯文本内容(钉钉/Slack 等)
 * @property {Object} [summary] - 摘要结构化数据
 */

/**
 * @typedef {Object} NotifyOptions
 * @property {string} [recipient] - 收件人/接收方(邮箱地址、群等)
 * @property {Object} [channelConfig] - 该渠道的额外配置
 */

/**
 * 通知器接口 - 所有渠道实现必须提供 send(content, options)
 * @interface
 */
export class NotifierBase {
  /**
   * 发送通知
   * @param {NotifyContent} content - 通知内容
   * @param {NotifyOptions} [options] - 选项(如收件人)
   * @returns {Promise<void>}
   */
  async send(content, options = {}) {
    throw new Error('子类必须实现 send(content, options)');
  }

  /**
   * 是否已配置(有足够的环境变量/配置)
   * @returns {boolean}
   */
  isConfigured() {
    return true;
  }
}
