/**
 * 抓取 GitHub Trending 页面
 */
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { TrendingProject } from './types/index.js';

const BASE_URL = 'https://github.com';
const DEFAULT_TIMEOUT_MS = 60000; // 60 秒，国内访问 GitHub 可能较慢

export async function fetchTrending(
  language = '',
  since = 'daily',
  maxProjects = 10
): Promise<TrendingProject[]> {
  const path = language ? `/trending/${encodeURIComponent(language)}` : '/trending';
  const url = `${BASE_URL}${path}?since=${since}`;
  const timeoutMs =
    typeof process.env.SCRAPER_TIMEOUT_MS !== 'undefined'
      ? parseInt(process.env.SCRAPER_TIMEOUT_MS, 10)
      : DEFAULT_TIMEOUT_MS;

  const { data: html } = await axios.get<string>(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: Number.isNaN(timeoutMs) ? DEFAULT_TIMEOUT_MS : Math.max(5000, timeoutMs),
  });

  const $ = cheerio.load(html);
  const items: TrendingProject[] = [];
  const articleSelector = 'article.Box-row';

  $(articleSelector).each((i, el) => {
    if (i >= maxProjects) return false;

    const $el = $(el);
    const link = $el.find('h2 a').attr('href') || '';
    const name = link.replace(/^\//, '').trim();
    const description = $el.find('p').first().text().trim();
    const langEl = $el.find('[itemprop="programmingLanguage"]');
    const lang = langEl.length ? langEl.text().trim() : '';

    const starLinks = $el.find('a[href*="/stargazers"]');
    const starsText = starLinks.length ? $(starLinks[0]).text().trim().replace(/,/g, '') : '0';
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

    const projectUrl = name ? `${BASE_URL}/${name}` : '';

    items.push({
      name,
      description,
      stars,
      forks,
      starsToday,
      language: lang,
      url: projectUrl,
    });
  });

  return items;
}
