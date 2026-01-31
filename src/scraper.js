/**
 * 抓取 GitHub Trending 页面
 */
import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://github.com';

/**
 * @typedef {Object} TrendingProject
 * @property {string} name - 项目名 owner/repo
 * @property {string} description - 描述
 * @property {number} stars - Star 数
 * @property {number} forks - Fork 数
 * @property {string} starsToday - 今日新增 Star 文案(如 +456)
 * @property {string} language - 主要编程语言
 * @property {string} url - 项目链接
 */

/**
 * 抓取 GitHub Trending 列表
 * @param {string} [language=''] - 编程语言(空为全部)
 * @param {string} [since='daily'] - 时间范围 daily | weekly | monthly
 * @param {number} [maxProjects=10] - 最大项目数
 * @returns {Promise<TrendingProject[]>}
 */
export async function fetchTrending(language = '', since = 'daily', maxProjects = 10) {
  const path = language ? `/trending/${encodeURIComponent(language)}` : '/trending';
  const url = `${BASE_URL}${path}?since=${since}`;

  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(html);
  const items = [];
  const articleSelector = 'article.Box-row';

  $(articleSelector).each((i, el) => {
    if (i >= maxProjects) return false;

    const $el = $(el);
    const link = $el.find('h2 a').attr('href') || '';
    const name = link.replace(/^\//, '').trim();
    const description = $el.find('p').first().text().trim();
    const langEl = $el.find('[itemprop="programmingLanguage"]');
    const language = langEl.length ? langEl.text().trim() : '';

    const links = $el.find('a[href*="/stargazers"]');
    const starsText = links.length ? $(links[0]).text().trim().replace(/,/g, '') : '0';
    const stars = parseInt(starsText, 10) || 0;

    const forkLink = $el.find('a[href*="?type=fork"]');
    const forksText = forkLink.length ? forkLink.text().trim().replace(/,/g, '') : '0';
    const forks = parseInt(forksText, 10) || 0;

    const starsTodayEl = $el.find('span.d-inline-block.float-sm-right');
    let starsToday = '';
    if (starsTodayEl.length) {
      const raw = starsTodayEl.text().trim();
      const match = raw.match(/[\d,]+/);
      if (match) starsToday = '+' + match[0].replace(/,/g, '');
    }

    const url = name ? `${BASE_URL}/${name}` : '';

    items.push({
      name,
      description,
      stars,
      forks,
      starsToday,
      language,
      url,
    });
  });

  return items;
}
