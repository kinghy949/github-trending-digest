/**
 * 通知渠道模块 - 可扩展多通道
 * 第一期仅实现 email，钉钉已预留实现，扩展其他渠道只需在此注册
 */
import { EmailNotifier } from './email.js';
import { DingTalkNotifier } from './dingtalk.js';
import type { Notifier } from '../types/index.js';

const registry: Record<string, Notifier> = {
  email: new EmailNotifier(),
  dingtalk: new DingTalkNotifier(),
};

export function getNotifiers(channelNames?: string[]): Notifier[] {
  const names =
    channelNames ??
    (process.env.NOTIFY_CHANNELS || 'email')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  const notifiers: Notifier[] = [];
  for (const name of names) {
    const notifier = registry[name];
    if (notifier?.isConfigured()) {
      notifiers.push(notifier);
    }
  }
  return notifiers;
}

export function getNotifier(name: string): Notifier | undefined {
  return registry[name];
}

export { registry };
