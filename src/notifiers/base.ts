/**
 * 通知渠道抽象基类
 * 第一期仅实现 email，后续扩展钉钉/企业微信/Slack 等只需继承此类并注册
 */
import type { NotifyContent, NotifyOptions } from '../types/index.js';

export abstract class NotifierBase {
  abstract send(content: NotifyContent, options?: NotifyOptions): Promise<void>;

  isConfigured(): boolean {
    return true;
  }
}
