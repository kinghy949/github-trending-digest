/**
 * 通知渠道模块 - 可扩展多通道
 * 第一期仅实现 email，钉钉已预留实现，扩展其他渠道只需在此注册
 */
import { EmailNotifier } from './email.js';
import { DingTalkNotifier } from './dingtalk.js';

const registry = {
  email: new EmailNotifier(),
  dingtalk: new DingTalkNotifier(),
  // 后续扩展: slack: new SlackNotifier(),
};

/**
 * 根据配置的渠道名列表，返回已配置的 Notifier 实例
 * @param {string[]} [channelNames] - 如 ['email', 'dingtalk']，默认从 NOTIFY_CHANNELS 读取
 * @returns {import('./base.js').NotifierBase[]}
 */
export function getNotifiers(channelNames) {
  const names = channelNames ?? (process.env.NOTIFY_CHANNELS || 'email').split(',').map(s => s.trim()).filter(Boolean);
  const notifiers = [];
  for (const name of names) {
    const notifier = registry[name];
    if (notifier && notifier.isConfigured()) {
      notifiers.push(notifier);
    }
  }
  return notifiers;
}

/**
 * 获取单个渠道的 Notifier
 * @param {string} name - 如 'email' | 'dingtalk'
 * @returns {import('./base.js').NotifierBase | undefined}
 */
export function getNotifier(name) {
  return registry[name];
}

export { registry };
