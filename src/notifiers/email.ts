import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { NotifierBase } from './base.js';
import type { NotifyContent, NotifyOptions } from '../types/index.js';

export class EmailNotifier extends NotifierBase {
  private _transporter: Transporter | null = null;

  get transporter(): Transporter {
    if (!this._transporter) {
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;
      if (!user || !pass) throw new Error('缺少环境变量 EMAIL_USER 或 EMAIL_PASS');
      const connectionTimeout =
        process.env.SMTP_CONNECTION_TIMEOUT !== undefined
          ? parseInt(process.env.SMTP_CONNECTION_TIMEOUT, 10)
          : 30000;
      this._transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: { user, pass },
        connectionTimeout: Number.isNaN(connectionTimeout) ? 30000 : Math.max(5000, connectionTimeout),
        greetingTimeout: 10000,
      });
    }
    return this._transporter;
  }

  isConfigured(): boolean {
    return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  }

  async send(content: NotifyContent, options: NotifyOptions = {}): Promise<void> {
    const recipient = options.recipient || process.env.RECIPIENT_EMAIL;
    if (!recipient) throw new Error('未指定收件人: RECIPIENT_EMAIL 或 options.recipient');

    // 只发 HTML，避免部分客户端同时展示 html + 纯文本导致重复或收两封
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: content.subject || 'GitHub Trending Daily Digest',
      html: content.html || content.text || '',
    });
  }
}
