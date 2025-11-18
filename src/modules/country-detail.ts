/**
 * 国家详情模块
 * 负责国家详情模态窗口的显示和维基百科内容加载
 */

import type { Country } from '../types';
import { i18n } from '../lib/i18n-core';
import { getFlagImageUrl } from '../lib/data-loader';

/**
 * 国家详细信息接口
 */
interface CountryInfo {
  code: string;
  basic?: {
    capital?: { zh: string; en: string };
    population?: { zh: string; en: string };
    area?: { zh: string; en: string };
    currency?: { zh: string; en: string };
    language?: { zh: string; en: string };
    gdp?: { zh: string; en: string };
  };
  description?: {
    zh: string;
    en: string;
  };
  funFacts?: {
    zh: string[];
    en: string[];
  };
  wikiUrl?: {
    zh: string;
    en: string;
  };
}

/**
 * 维基百科缓存项
 */
interface WikiCacheItem {
  content: string;
  timestamp: number;
}

/**
 * 国家详情模块类
 */
class CountryDetailModule {
  private countriesInfoData: CountryInfo[] | null = null;
  private wikiCache: Map<string, string> = new Map();

  /**
   * 加载国家详细信息数据
   */
  async loadCountriesInfo(): Promise<CountryInfo[]> {
    if (this.countriesInfoData) {
      return this.countriesInfoData;
    }

    try {
      const response = await fetch('/data/countries/countries_info.json');
      if (!response.ok) {
        throw new Error('Failed to load countries info');
      }
      const data = await response.json();
      const countries = data.countries || [];
      this.countriesInfoData = countries;
      console.log('✅ 国家详细信息数据加载完成:', countries.length, '个国家');
      return countries;
    } catch (error) {
      console.warn('⚠️ 国家详细信息数据加载失败:', error);
      this.countriesInfoData = [];
      return [];
    }
  }

  /**
   * 获取国家详细信息
   */
  getCountryInfo(countryCode: string): CountryInfo | null {
    if (!this.countriesInfoData) {
      return null;
    }
    return this.countriesInfoData.find((c) => c.code === countryCode) || null;
  }

  /**
   * 显示国家详情模态窗口
   */
  async showCountryDetail(country: Country): Promise<void> {
    const modal = document.getElementById('country-detail-modal');
    if (!modal) {
      console.error('模态窗口元素未找到');
      return;
    }

    // 确保已加载国家详细信息数据
    await this.loadCountriesInfo();

    // 获取国家详细信息
    const countryInfo = this.getCountryInfo(country.code);
    const currentLang = i18n.getCurrentLanguage();

    // 设置国旗和标题
    const modalFlag = modal.querySelector('.modal-flag') as HTMLImageElement;
    const primaryName = modal.querySelector('.modal-country-name-primary');
    const secondaryName = modal.querySelector('.modal-country-name-secondary');

    if (modalFlag) {
      modalFlag.src = getFlagImageUrl(country.code);
      modalFlag.alt = country.nameCN;
    }

    if (currentLang === 'en') {
      if (primaryName) primaryName.textContent = country.nameEN;
      if (secondaryName) secondaryName.textContent = country.nameCN;
    } else {
      if (primaryName) primaryName.textContent = country.nameCN;
      if (secondaryName) secondaryName.textContent = country.nameEN;
    }

    // 填充基本信息
    if (countryInfo?.basic) {
      const fields = ['capital', 'population', 'area', 'currency', 'language', 'gdp'] as const;
      fields.forEach((field) => {
        const element = modal.querySelector(`[data-field="${field}"]`);
        if (element && countryInfo.basic?.[field]) {
          element.textContent = countryInfo.basic[field]?.[currentLang] || '-';
        }
      });
    } else {
      // 如果没有详细信息,显示占位符
      const valueElements = modal.querySelectorAll('.info-value');
      valueElements.forEach((el) => {
        el.textContent = currentLang === 'en' ? 'Data coming soon' : '数据即将添加';
      });
    }

    // 填充国家简介
    const description = modal.querySelector('.country-description');
    if (description) {
      if (countryInfo?.description) {
        description.textContent =
          countryInfo.description[currentLang] ||
          (currentLang === 'en' ? 'Description coming soon...' : '简介即将添加...');
      } else {
        description.textContent =
          currentLang === 'en' ? 'Description coming soon...' : '简介即将添加...';
      }
    }

    // 填充有趣的事实
    const funFactsList = modal.querySelector('.fun-facts-list');
    if (funFactsList) {
      funFactsList.innerHTML = '';
      if (countryInfo?.funFacts?.[currentLang]) {
        countryInfo.funFacts[currentLang].forEach((fact) => {
          const li = document.createElement('li');
          li.textContent = fact;
          funFactsList.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent =
          currentLang === 'en' ? 'Fun facts coming soon...' : '有趣的事实即将添加...';
        funFactsList.appendChild(li);
      }
    }

    // 重置维基百科内容区域
    const wikiContent = modal.querySelector('.wiki-content') as HTMLElement;
    if (wikiContent) {
      wikiContent.style.display = 'none';
      wikiContent.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p data-i18n="countryDetail.loading">正在加载详细信息...</p>
        </div>
      `;
    }

    // 设置"了解更多"按钮
    const learnMoreBtn = modal.querySelector('.learn-more-btn') as HTMLButtonElement;
    if (learnMoreBtn) {
      learnMoreBtn.onclick = () => this.loadWikipediaContent(country, countryInfo, currentLang);
    }

    // 显示模态窗口
    (modal as HTMLElement).style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
  }

  /**
   * 加载维基百科内容
   */
  async loadWikipediaContent(
    country: Country,
    countryInfo: CountryInfo | null,
    lang: string
  ): Promise<void> {
    const modal = document.getElementById('country-detail-modal');
    if (!modal) return;

    const wikiContent = modal.querySelector('.wiki-content') as HTMLElement;
    const learnMoreBtn = modal.querySelector('.learn-more-btn') as HTMLElement;

    if (!wikiContent || !learnMoreBtn) return;

    // 如果内容区域已显示,则折叠
    if (wikiContent.style.display === 'block') {
      wikiContent.style.display = 'none';
      learnMoreBtn.innerHTML = `<span data-i18n="countryDetail.learnMore">📖 从维基百科了解更多</span>`;
      return;
    }

    // 显示加载状态
    wikiContent.style.display = 'block';
    learnMoreBtn.innerHTML = `<span data-i18n="countryDetail.loading">⏳ 正在加载...</span>`;

    // 检查缓存
    const cacheKey = `${country.code}_${lang}`;
    if (this.wikiCache.has(cacheKey)) {
      wikiContent.innerHTML = this.wikiCache.get(cacheKey)!;
      learnMoreBtn.innerHTML = `<span data-i18n="countryDetail.collapse">🔼 收起详细信息</span>`;
      return;
    }

    try {
      // 构建维基百科 API URL
      const wikiLang = lang === 'en' ? 'en' : 'zh';
      const searchTerm = lang === 'en' ? country.nameEN : country.nameCN;
      const apiUrl = `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Wikipedia API request failed');
      }

      const data = await response.json();

      // 构建内容HTML
      let contentHtml = '';

      if (data.extract) {
        contentHtml += `<p style="margin: 0 0 16px 0; line-height: 1.8; color: var(--text-primary);">${data.extract}</p>`;
      }

      if (data.thumbnail?.source) {
        contentHtml += `
          <img src="${data.thumbnail.source}"
               alt="${data.title}"
               style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        `;
      }

      // 添加维基百科链接
      const wikiUrlLang = lang as 'zh' | 'en';
      const wikiUrl =
        countryInfo?.wikiUrl?.[wikiUrlLang] || data.content_urls?.desktop?.page || '#';
      contentHtml += `
        <a href="${wikiUrl}"
           target="_blank"
           rel="noopener noreferrer"
           style="display: inline-block; margin-top: 12px; color: var(--primary-light); text-decoration: none; font-weight: 500;">
            🔗 ${lang === 'en' ? 'Read more on Wikipedia' : '在维基百科上阅读更多'} →
        </a>
      `;

      // 缓存内容
      this.wikiCache.set(cacheKey, contentHtml);

      // 显示内容
      wikiContent.innerHTML = contentHtml;
      learnMoreBtn.innerHTML = `<span data-i18n="countryDetail.collapse">🔼 收起详细信息</span>`;

      // 保存到本地存储
      this.saveWikiToLocalStorage(cacheKey, contentHtml);
    } catch (error) {
      console.error('加载维基百科内容失败:', error);
      const wikiUrlLang = lang as 'zh' | 'en';
      const wikiUrl = countryInfo?.wikiUrl?.[wikiUrlLang] || '#';
      wikiContent.innerHTML = `
        <p style="color: var(--text-muted); text-align: center;">
          ${lang === 'en' ? '❌ Failed to load content. Please check your internet connection.' : '❌ 加载失败,请检查网络连接。'}
        </p>
        <a href="${wikiUrl}"
           target="_blank"
           rel="noopener noreferrer"
           style="display: inline-block; margin-top: 12px; color: var(--primary-light); text-decoration: none; font-weight: 500;">
            🔗 ${lang === 'en' ? 'Visit Wikipedia directly' : '直接访问维基百科'} →
        </a>
      `;
      learnMoreBtn.innerHTML = `<span data-i18n="countryDetail.collapse">🔼 收起详细信息</span>`;
    }
  }

  /**
   * 关闭国家详情模态窗口
   */
  closeCountryDetail(): void {
    const modal = document.getElementById('country-detail-modal');
    if (modal) {
      (modal as HTMLElement).style.display = 'none';
      document.body.style.overflow = ''; // 恢复背景滚动
    }
  }

  /**
   * 保存维基百科内容到本地存储
   */
  private saveWikiToLocalStorage(key: string, content: string): void {
    try {
      const stored: Record<string, WikiCacheItem> = JSON.parse(
        localStorage.getItem('wikiCache') || '{}'
      );
      stored[key] = {
        content: content,
        timestamp: Date.now(),
      };

      // 只保留最近50个缓存
      const entries = Object.entries(stored);
      if (entries.length > 50) {
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        const newStored = Object.fromEntries(entries.slice(0, 50));
        localStorage.setItem('wikiCache', JSON.stringify(newStored));
      } else {
        localStorage.setItem('wikiCache', JSON.stringify(stored));
      }
    } catch (error) {
      console.warn('保存到本地存储失败:', error);
    }
  }

  /**
   * 从本地存储加载维基百科缓存
   */
  loadWikiFromLocalStorage(): void {
    try {
      const stored: Record<string, WikiCacheItem> = JSON.parse(
        localStorage.getItem('wikiCache') || '{}'
      );
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天

      Object.entries(stored).forEach(([key, value]) => {
        if (now - value.timestamp < maxAge) {
          this.wikiCache.set(key, value.content);
        }
      });

      console.log('✅ 从本地存储加载了', this.wikiCache.size, '个维基百科缓存');
    } catch (error) {
      console.warn('从本地存储加载缓存失败:', error);
    }
  }
}

// 创建单例实例
export const countryDetailModule = new CountryDetailModule();

/**
 * 初始化国家详情模块
 */
// 初始化标志
let countryDetailModuleInitialized = false;

export function initCountryDetailModule(): void {
  // 防止重复初始化
  if (countryDetailModuleInitialized) {
    return;
  }

  const modal = document.getElementById('country-detail-modal');
  if (!modal) {
    console.warn('国家详情模态窗口元素未找到');
    return;
  }

  // 关闭按钮事件
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => countryDetailModule.closeCountryDetail());
  }

  // 点击遮罩层关闭
  const overlay = modal.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => countryDetailModule.closeCountryDetail());
  }

  // ESC键关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (modal as HTMLElement).style.display === 'flex') {
      countryDetailModule.closeCountryDetail();
    }
  });

  // 加载本地存储的缓存
  countryDetailModule.loadWikiFromLocalStorage();

  countryDetailModuleInitialized = true;
  console.log('✅ 国家详情模态窗口初始化完成');
}

// 导出到全局（向后兼容）
if (typeof window !== 'undefined') {
  (window as any).countryDetailModule = countryDetailModule;
  (window as any).showCountryDetail = (country: Country) =>
    countryDetailModule.showCountryDetail(country);
  (window as any).closeCountryDetail = () => countryDetailModule.closeCountryDetail();
}
