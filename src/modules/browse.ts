/**
 * 浏览功能模块
 * 负责国家卡片的显示、筛选和排序
 */

import type { Country } from '../types';
import { appState, getFilteredCountries } from '../lib/state';
import { DATA_SOURCES } from '../lib/constants';
import { safeSetText } from '../lib/utils';
import { i18n } from '../lib/i18n-core';
import { getFlagImageUrl } from '../lib/data-loader';
import { countryDetailModule } from './country-detail';

/**
 * 应用筛选逻辑
 */
export function applyFilters(): void {
  const state = appState.getState();
  let filtered = [...state.allCountries];

  // 数据来源筛选
  if (state.selectedDataSource !== 'all') {
    const sourceCountries = DATA_SOURCES[state.selectedDataSource]?.countries;
    if (sourceCountries) {
      filtered = filtered.filter((c) => sourceCountries.includes(c.code));
    }
  }

  // 搜索筛选
  if (state.searchTerm) {
    const searchLower = state.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.nameCN.toLowerCase().includes(searchLower) || c.nameEN.toLowerCase().includes(searchLower)
    );
  }

  // 大洲筛选
  if (state.selectedContinent !== 'all') {
    filtered = filtered.filter((c) => c.continent === state.selectedContinent);
  }

  // 风格筛选
  if (state.selectedStyles.size > 0) {
    filtered = filtered.filter(
      (c) => c.styles && c.styles.some((s) => state.selectedStyles.has(s))
    );
  }

  // 排序
  sortCountries(filtered, state.sortMethod);

  // 更新状态
  appState.setFilteredCountries(filtered);

  // 更新UI
  updateStats();
  displayFlags();
}

/**
 * 排序国家
 */
function sortCountries(countries: Country[], method: string): void {
  switch (method) {
    case 'name':
      countries.sort((a, b) => a.nameEN.localeCompare(b.nameEN));
      break;
    case 'continent':
      countries.sort((a, b) => {
        if (a.continent === b.continent) {
          return a.nameCN.localeCompare(b.nameCN);
        }
        return a.continent.localeCompare(b.continent);
      });
      break;
    case 'random':
      countries.sort(() => Math.random() - 0.5);
      break;
    default:
      // 默认按名称排序
      countries.sort((a, b) => a.nameCN.localeCompare(b.nameCN));
  }
}

/**
 * 更新统计信息
 */
function updateStats(): void {
  const state = appState.getState();
  let totalCount = state.allCountries.length;

  // 如果选择了特定数据源，更新总数
  if (state.selectedDataSource !== 'all') {
    const sourceCountries = DATA_SOURCES[state.selectedDataSource]?.countries;
    if (sourceCountries) {
      totalCount = state.allCountries.filter((c) => sourceCountries.includes(c.code)).length;
    }
  }

  safeSetText('totalCount', totalCount.toString());
  safeSetText('filteredCount', state.filteredCountries.length.toString());
}

/**
 * 显示国旗卡片
 */
export function displayFlags(): void {
  const container = document.getElementById('flags-container');
  if (!container) return;

  const filteredCountries = getFilteredCountries();

  // 如果没有结果，显示空状态
  if (filteredCountries.length === 0) {
    displayEmptyState(container);
    return;
  }

  // 获取模板
  const flagTemplate = document.getElementById('flag-card-template') as HTMLTemplateElement;
  if (!flagTemplate) {
    console.error('Flag card template not found');
    return;
  }

  // 清空容器
  container.innerHTML = '';

  // 渲染每个国家卡片
  filteredCountries.forEach((country) => {
    const card = createCountryCard(country, flagTemplate);
    container.appendChild(card);
  });

  // 导出到全局（用于兼容性）
  if (typeof window !== 'undefined') {
    (window as any).filteredCountries = filteredCountries;
  }
}

/**
 * 显示空状态
 */
function displayEmptyState(container: HTMLElement): void {
  const emptyTemplate = document.getElementById('empty-state-template') as HTMLTemplateElement;
  if (emptyTemplate) {
    container.innerHTML = '';
    const emptyState = emptyTemplate.content.cloneNode(true);
    container.appendChild(emptyState);
  } else {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-icon">🔍</div>
        <h3>没有找到匹配的国旗</h3>
        <p>请尝试调整筛选条件</p>
      </div>
    `;
  }
}

/**
 * 创建国家卡片
 */
function createCountryCard(country: Country, template: HTMLTemplateElement): DocumentFragment {
  const card = template.content.cloneNode(true) as DocumentFragment;
  const cardElement = card.querySelector('.flag-card') as HTMLElement;

  if (!cardElement) return card;

  // 设置国旗图片
  const flagImg = card.querySelector('.flag-img') as HTMLImageElement;
  if (flagImg) {
    flagImg.src = getFlagImageUrl(country.code);
    flagImg.alt = `${country.nameCN}国旗`;
  }

  // 设置国家名称
  const nameCN = card.querySelector('.flag-name-cn');
  const nameEN = card.querySelector('.flag-name-en');
  const isEnglishMode = i18n.getCurrentLanguage() === 'en';

  if (nameCN) {
    nameCN.textContent = isEnglishMode ? country.nameEN : country.nameCN;
  }
  if (nameEN) {
    nameEN.textContent = isEnglishMode ? country.nameCN : country.nameEN;
  }

  // 设置大洲标签
  const continentTag = card.querySelector('.continent-tag');
  if (continentTag) {
    continentTag.textContent = i18n.getContinentName(country.continent);
  }

  // 设置特征标签
  const styleTag = card.querySelector('.style-tag');
  if (styleTag && country.styles && country.styles.length > 0) {
    styleTag.textContent = i18n.getFeatureName(country.styles[0]);
    styleTag.setAttribute('data-feature', country.styles[0]);
  }

  // 设置点击事件（打开国家详情）
  cardElement.addEventListener('click', () => {
    showCountryDetail(country);
  });

  return card;
}

/**
 * 显示国家详情
 */
function showCountryDetail(country: Country): void {
  // 直接调用国家详情模块显示详情
  countryDetailModule.showCountryDetail(country);
}

/**
 * 初始化浏览模块的事件监听
 */
export function initBrowseModule(): void {
  // 搜索输入
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = (e.target as HTMLInputElement).value.toLowerCase();
      appState.setSearchTerm(term);
      applyFilters();
    });
  }

  // 数据源选择
  const dataSourceSelect = document.getElementById('dataSourceSelect') as HTMLSelectElement;
  if (dataSourceSelect) {
    // 初始化时同步HTML的默认值到state
    const initialSource = dataSourceSelect.value as any;
    if (initialSource) {
      appState.setDataSource(initialSource);
    }

    dataSourceSelect.addEventListener('change', (e) => {
      const source = (e.target as HTMLSelectElement).value as any;
      appState.setDataSource(source);
      applyFilters();
    });
  }

  // 大洲筛选（使用下拉框）
  const continentSelect = document.getElementById('continentSelect') as HTMLSelectElement;
  if (continentSelect) {
    // 初始化时同步HTML的默认值到state
    const initialContinent = continentSelect.value;
    if (initialContinent) {
      appState.setSelectedContinent(initialContinent);
    }

    continentSelect.addEventListener('change', (e) => {
      const continent = (e.target as HTMLSelectElement).value;
      appState.setSelectedContinent(continent);
      applyFilters();
    });
  }

  // 特征筛选按钮
  const styleButtons = document.querySelectorAll('.style-btn');
  styleButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const style = (e.target as HTMLElement).dataset.style;
      if (style) {
        appState.toggleStyle(style);
        btn.classList.toggle('active');
        applyFilters();
      }
    });
  });

  // 排序按钮
  const sortButtons = document.querySelectorAll('[data-sort]');
  sortButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const method = (e.target as HTMLElement).dataset.sort || 'name';
      appState.setSortMethod(method);

      // 更新按钮状态
      sortButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      applyFilters();
    });
  });

  // 应用初始筛选（使用HTML中设置的默认值）
  applyFilters();

  console.log('✅ Browse module initialized');
}

/**
 * 重新渲染浏览卡片（用于语言切换）
 */
export function rerenderBrowseCards(): void {
  const flagsContainer = document.getElementById('flags-container');
  if (!flagsContainer) {
    console.warn('rerenderBrowseCards: flags-container not found');
    return;
  }

  const filteredCountries = getFilteredCountries();
  if (filteredCountries.length === 0) {
    return;
  }

  const flagCards = flagsContainer.querySelectorAll('.flag-card');
  const isEnglishMode = i18n.getCurrentLanguage() === 'en';

  flagCards.forEach((card, index) => {
    if (index < filteredCountries.length) {
      const country = filteredCountries[index];
      const nameCN = card.querySelector('.flag-name-cn');
      const nameEN = card.querySelector('.flag-name-en');

      if (isEnglishMode) {
        if (nameCN) nameCN.textContent = country.nameEN;
        if (nameEN) nameEN.textContent = country.nameCN;
      } else {
        if (nameCN) nameCN.textContent = country.nameCN;
        if (nameEN) nameEN.textContent = country.nameEN;
      }

      // 更新大洲标签
      const continentTag = card.querySelector('.continent-tag');
      if (continentTag) {
        continentTag.textContent = i18n.getContinentName(country.continent);
      }

      // 更新特征标签
      const styleTag = card.querySelector('.style-tag');
      if (styleTag && country.styles && country.styles.length > 0) {
        styleTag.textContent = i18n.getFeatureName(country.styles[0]);
      }
    }
  });
}
