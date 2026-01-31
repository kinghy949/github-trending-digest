import nodemailer from 'nodemailer';
import { NotifierBase } from './base.js';

export class EmailNotifier extends NotifierBase {
  constructor() {
    super();
    this._transporter = null;
  }

  get transporter() {
    if (!this._transporter) {
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;
      if (!user || !pass) throw new Error('缺少环境变量 EMAIL_USER 或 EMAIL_PASS');
      this._transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: { user, pass },
      });
    }
    return this._transporter;
  }

  isConfigured() {
    return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  }

  /**
   * @param {import('./base.js').NotifyContent} content
   * @param {import('./base.js').NotifyOptions} options
   */
  async send(content, options = {}) {
    const recipient = options.recipient || process.env.RECIPIENT_EMAIL;
    if (!recipient) throw new Error('未指定收件人: RECIPIENT_EMAIL 或 options.recipient');

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: content.subject || 'GitHub Trending Daily Digest',
      html: content.html || content.text || '',
      text: content.text || (content.html ? content.html.replace(/<[^>]+>/g, '') : ''),
    });
  }
}
