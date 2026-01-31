/**
 * 钉钉机器人通知
 * 配置: DINGTALK_WEBHOOK, DINGTALK_SECRET(可选，加签时必填)
 * 使用: NOTIFY_CHANNELS=email,dingtalk
 */
import crypto from 'crypto';
import axios from 'axios';
import { NotifierBase } from './base.js';

function buildSignedUrl(webhook, secret) {
  if (!secret) return webhook;
  const timestamp = Date.now().toString();
  const stringToSign = timestamp + '\n' + secret;
  const sign = encodeURIComponent(
    crypto.createHmac('sha256', secret).update(stringToSign).digest('base64')
  );
  const sep = webhook.includes('?') ? '&' : '?';
  return `${webhook}${sep}timestamp=${timestamp}&sign=${sign}`;
}

export class DingTalkNotifier extends NotifierBase {
  isConfigured() {
    return !!process.env.DINGTALK_WEBHOOK;
  }

  /**
   * @param {import('./base.js').NotifyContent} content
   * @param {import('./base.js').NotifyOptions} options
   */
  async send(content, options = {}) {
    const webhook = process.env.DINGTALK_WEBHOOK;
    if (!webhook) throw new Error('未配置 DINGTALK_WEBHOOK');

    const url = buildSignedUrl(webhook, process.env.DINGTALK_SECRET || '');
    const text = content.text || (content.html ? content.html.replace(/<[^>]+>/g, '').trim() : '');
    const body = {
      msgtype: 'markdown',
      markdown: {
        title: content.subject || 'GitHub Trending Digest',
        text: text.slice(0, 5000),
      },
    };

    await axios.post(url, body, { timeout: 10000 });
  }
}
