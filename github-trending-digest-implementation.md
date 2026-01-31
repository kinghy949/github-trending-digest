# GitHub Trending Digest - 实现方案

## 项目名称
**GitHub Trending Digest** (GitHub热榜摘要)

一个基于GitHub Actions的自动化工具,每日抓取GitHub Trending项目,通过AI智能总结后推送到邮箱。

---

## 技术栈
- **运行环境**: GitHub Actions
- **开发语言**: Node.js (v18+)
- **核心依赖**:
  - `axios` - HTTP请求
  - `cheerio` - HTML解析(类似jQuery)
  - `nodemailer` - 邮件发送
  - `@anthropic-ai/sdk` - Claude AI总结

---

## 项目结构

```
github-trending-digest/
├── .github/
│   └── workflows/
│       └── daily-digest.yml          # GitHub Actions工作流
├── src/
│   ├── scraper.js                    # 抓取trending页面
│   ├── summarizer.js                 # AI总结生成器
│   ├── mailer.js                     # 邮件发送模块
│   ├── template.js                   # 邮件HTML模板
│   └── index.js                      # 主入口
├── config/
│   └── default.json                  # 默认配置
├── .env.example                      # 环境变量示例
├── package.json
├── .gitignore
└── README.md                         # 部署文档
```

---

## 核心模块设计

### 1. scraper.js - 数据抓取模块
```javascript
/**
 * 抓取GitHub Trending页面
 * @param {string} language - 编程语言(可选)
 * @param {string} since - 时间范围(daily/weekly/monthly)
 * @returns {Array} 项目列表
 */
async function fetchTrending(language = '', since = 'daily') {
  // 目标URL: https://github.com/trending/javascript?since=daily
  // 解析项目信息:
  // - 项目名称
  // - 项目描述
  // - Star数量
  // - Fork数量
  // - 今日新增Star
  // - 主要编程语言
  // - 项目链接
}
```

### 2. summarizer.js - AI总结模块
```javascript
/**
 * 使用Claude API生成智能摘要
 * @param {Array} projects - 项目列表
 * @param {string} language - 目标语言(zh-CN/en)
 * @returns {Object} 总结内容
 */
async function generateSummary(projects, language = 'zh-CN') {
  // 调用Anthropic Claude API
  // 生成内容:
  // - 今日亮点总结
  // - 项目分类(AI/Web/工具等)
  // - 每个项目的一句话介绍
  // - 推荐理由
}
```

### 3. mailer.js - 邮件发送模块
```javascript
/**
 * 发送HTML格式邮件
 * @param {Object} content - 邮件内容
 * @param {string} recipient - 收件人
 */
async function sendEmail(content, recipient) {
  // 支持邮件服务:
  // - Gmail
  // - QQ邮箱
  // - 163邮箱
  // - 企业邮箱(SMTP)
}
```

### 4. template.js - 邮件模板
```javascript
/**
 * 生成精美的HTML邮件模板
 * @param {Object} data - 摘要数据
 * @returns {string} HTML内容
 */
function generateEmailTemplate(data) {
  // 包含:
  // - 响应式设计
  // - 项目卡片布局
  // - Star/Fork数据可视化
  // - 一键跳转到GitHub项目
}
```

---

## GitHub Actions 工作流

### .github/workflows/daily-digest.yml
```yaml
name: GitHub Trending Daily Digest

on:
  schedule:
    # 每天UTC时间01:00执行(北京时间09:00)
    - cron: '0 1 * * *'
  workflow_dispatch:  # 支持手动触发

jobs:
  send-digest:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout代码
        uses: actions/checkout@v4
      
      - name: 设置Node.js环境
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: 安装依赖
        run: npm ci
      
      - name: 执行摘要生成与发送
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          EMAIL_USER: ${{ secrets.EMAIL_USER }}
          EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
          RECIPIENT_EMAIL: ${{ secrets.RECIPIENT_EMAIL }}
          LANGUAGE_FILTER: ${{ vars.LANGUAGE_FILTER }}
          SINCE: ${{ vars.SINCE }}
        run: node src/index.js
```

---

## 配置说明

### GitHub Secrets (必须配置)
在仓库的 `Settings > Secrets and variables > Actions` 中添加:

| Secret名称 | 说明 | 示例 |
|-----------|------|------|
| `ANTHROPIC_API_KEY` | Claude API密钥 | sk-ant-xxx |
| `EMAIL_USER` | 发件邮箱 | your@gmail.com |
| `EMAIL_PASS` | 邮箱授权码/密码 | xxxx xxxx xxxx xxxx |
| `RECIPIENT_EMAIL` | 收件邮箱 | recipient@gmail.com |

### GitHub Variables (可选配置)
在 `Settings > Secrets and variables > Actions > Variables` 中添加:

| Variable名称 | 说明 | 默认值 | 可选值 |
|-------------|------|--------|--------|
| `LANGUAGE_FILTER` | 编程语言过滤 | 空(全部) | javascript, python, go等 |
| `SINCE` | 时间范围 | daily | daily, weekly, monthly |
| `SUMMARY_LANGUAGE` | 摘要语言 | zh-CN | zh-CN, en |
| `MAX_PROJECTS` | 最大项目数 | 10 | 1-25 |

---

## 部署步骤

### 1. Fork/创建仓库
```bash
# 方式一: 使用模板(推荐)
# 在GitHub上点击 "Use this template"

# 方式二: 克隆到本地
git clone https://github.com/your-username/github-trending-digest.git
cd github-trending-digest
```

### 2. 本地测试
```bash
# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 编辑.env文件,填入配置
# ANTHROPIC_API_KEY=your_api_key
# EMAIL_USER=your_email
# EMAIL_PASS=your_password
# RECIPIENT_EMAIL=recipient_email

# 测试运行
npm test
```

### 3. 配置GitHub Secrets
1. 进入你的GitHub仓库
2. 点击 `Settings` > `Secrets and variables` > `Actions`
3. 点击 `New repository secret`
4. 依次添加上述必需的Secrets

### 4. 配置定时任务时间(可选)
编辑 `.github/workflows/daily-digest.yml`:
```yaml
schedule:
  - cron: '0 1 * * *'  # 修改为你想要的时间
  # 0 1 * * * = UTC 01:00 (北京时间 09:00)
  # 0 13 * * * = UTC 13:00 (北京时间 21:00)
```

### 5. 启用GitHub Actions
1. 进入仓库的 `Actions` 标签
2. 如果显示工作流已禁用,点击 `Enable workflow`
3. 点击 `Run workflow` 进行首次手动测试

### 6. 验证运行
- 查看 `Actions` 标签中的运行日志
- 检查邮箱是否收到邮件
- 如有错误,查看详细日志进行调试

---

## 邮件效果预览

邮件将包含以下内容:

```
📧 GitHub Trending Daily Digest
📅 2026年1月31日

🔥 今日亮点
今天GitHub Trending榜单呈现出AI工具热潮,共有3个AI相关项目上榜...

━━━━━━━━━━━━━━━━━━━━━━━━

🏆 今日Top 10项目

1. awesome-ai/gpt-helper ⭐ 2,345 (↗️ +456)
   🏷️ Python | AI工具
   📝 一个强大的GPT辅助工具,支持多模型切换...
   🔗 查看项目 →

2. web-framework/next-gen ⭐ 1,892 (↗️ +312)
   🏷️ TypeScript | Web框架
   📝 下一代全栈Web框架,性能提升300%...
   🔗 查看项目 →

...
```

---

## 高级功能(可扩展)

### 1. 多语言支持
- 支持按语言分类发送
- 可订阅多个语言的Trending

### 2. 自定义过滤
- Star数阈值过滤
- 关键词匹配
- 排除某些类型项目

### 3. 多渠道推送
- 邮件
- 企业微信
- Slack
- Discord
- Telegram

### 4. 数据存储
- 保存历史数据
- 生成周报/月报
- 趋势分析

### 5. Web界面
- 在线预览
- 配置管理
- 订阅管理

---

## 常见问题

### Q1: 邮件发送失败?
**A**: 检查以下几点:
- Gmail需要开启"应用专用密码"
- QQ邮箱需要开启SMTP服务并获取授权码
- 检查防火墙设置

### Q2: GitHub Actions没有自动运行?
**A**: 
- 确认工作流文件路径正确
- 检查cron表达式格式
- Fork的仓库需要手动启用Actions

### Q3: Claude API调用失败?
**A**:
- 检查API Key是否正确
- 确认账户有足够余额
- 检查网络连接

### Q4: 想要更改发送时间?
**A**: 修改 `daily-digest.yml` 中的cron表达式
- 使用 https://crontab.guru/ 生成
- 注意GitHub Actions使用UTC时间

### Q5: 如何暂停推送?
**A**: 
- 在Actions页面禁用工作流
- 或者删除 `.github/workflows/daily-digest.yml`

---

## 成本说明

- **GitHub Actions**: 免费(公开仓库无限制)
- **Claude API**: 约$0.01-0.05/天(取决于项目数量)
- **邮件发送**: 免费(使用个人邮箱SMTP)

**预估月成本**: $0.3-1.5 (仅API费用)

---

## 技术亮点

✅ **零服务器成本** - 完全基于GitHub Actions
✅ **智能总结** - Claude AI提供高质量内容
✅ **即插即用** - Fork后简单配置即可使用
✅ **高度可定制** - 支持多种配置选项
✅ **安全可靠** - 敏感信息使用GitHub Secrets加密
✅ **开源免费** - MIT协议,可自由修改

---

## License
MIT License - 自由使用和修改

---

## 贡献
欢迎提交Issue和Pull Request!

**项目地址**: https://github.com/your-username/github-trending-digest
