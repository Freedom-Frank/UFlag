/**
 * 座位排位模块
 * 提供国际场合的国旗座位排位功能
 */

import type { Country } from '../types';
import type {
  SeatingRule,
  SeatingConfig,
  SeatingArrangement,
  LayoutType,
  DiplomaticRelations,
  SeatingTemplate,
} from '../types/seating';
import { appState, getAllCountries } from '../lib/state';
import { DATA_SOURCES } from '../lib/constants';
import { i18n } from '../lib/i18n-core';
import { safeSetText, safeSetDisplay } from '../lib/utils';
import { getFlagImageUrl } from '../lib/data-loader';

/**
 * 模块初始化标志
 */
let moduleInitialized = false;

/**
 * 当前配置
 */
let currentConfig: SeatingConfig = {
  rule: 'alphabetical-en',
};

/**
 * 当前布局类型
 */
let currentLayout: LayoutType = 'linear';

/**
 * 当前排位结果
 */
let currentArrangement: SeatingArrangement | null = null;

/**
 * 当前选择的数据源
 */
let currentDataSource: string = 'un';

/**
 * 建交时间数据（中国与各国）
 * 从 cn_diplomatic.txt 解析
 */
const diplomaticRelations: DiplomaticRelations = {
  // 亚洲
  af: '1955.1.20', // 阿富汗
  am: '1992.4.6', // 亚美尼亚
  az: '1992.4.2', // 阿塞拜疆
  bh: '1989.4.18', // 巴林
  bd: '1975.10.4', // 孟加拉国
  bn: '1991.9.30', // 文莱
  kh: '1958.7.19', // 柬埔寨
  kp: '1949.10.6', // 朝鲜
  tl: '2002.5.20', // 东帝汶
  ge: '1992.6.9', // 格鲁吉亚
  in: '1950.4.1', // 印度
  id: '1950.4.13', // 印度尼西亚
  ir: '1971.8.16', // 伊朗
  iq: '1958.8.25', // 伊拉克
  il: '1992.1.24', // 以色列
  jp: '1972.9.29', // 日本
  jo: '1977.4.7', // 约旦
  kz: '1992.1.3', // 哈萨克斯坦
  kw: '1971.3.22', // 科威特
  kg: '1992.1.5', // 吉尔吉斯斯坦
  la: '1961.4.25', // 老挝
  lb: '1971.11.9', // 黎巴嫩
  my: '1974.5.31', // 马来西亚
  mv: '1972.10.14', // 马尔代夫
  mn: '1949.10.16', // 蒙古
  mm: '1950.6.8', // 缅甸
  np: '1955.8.1', // 尼泊尔
  om: '1978.5.25', // 阿曼
  pk: '1951.5.21', // 巴基斯坦
  ps: '1988.11.20', // 巴勒斯坦
  ph: '1975.6.9', // 菲律宾
  qa: '1988.7.9', // 卡塔尔
  kr: '1992.8.24', // 韩国
  sa: '1990.7.21', // 沙特阿拉伯
  sg: '1990.10.3', // 新加坡
  lk: '1957.2.7', // 斯里兰卡
  sy: '1956.8.1', // 叙利亚
  tj: '1992.1.4', // 塔吉克斯坦
  th: '1975.7.1', // 泰国
  tr: '1971.8.4', // 土耳其
  tm: '1992.1.6', // 土库曼斯坦
  ae: '1984.11.1', // 阿联酋
  uz: '1992.1.2', // 乌兹别克斯坦
  vn: '1950.1.18', // 越南
  ye: '1956.9.24', // 也门
  // 其他大洲的数据可以继续添加...
};

/**
 * 法文字母排序映射表
 * 处理法文特殊字符的排序
 */
const frenchCollator = new Intl.Collator('fr', { sensitivity: 'base' });

/**
 * 预设配置模板
 */
const PRESET_TEMPLATES: SeatingTemplate[] = [
  {
    id: 'un-general-assembly',
    name: '联合国大会',
    description: '联合国成员国，英文字母顺序排列',
    icon: '🌐',
    dataSource: 'un',
    rule: 'alphabetical-en',
    recommendedLayout: 'grid',
  },
  {
    id: 'g20-summit',
    name: 'G20峰会',
    description: '二十国集团，主办国优先',
    icon: '🏛️',
    dataSource: 'g20',
    rule: 'host-first',
    hostCountry: 'cn',
    recommendedLayout: 'circular',
  },
  {
    id: 'olympic-ceremony',
    name: '奥运会入场',
    description: '希腊第一、东道主最后、其余按英文字母',
    icon: '🏅',
    dataSource: 'un',
    rule: 'olympic',
    hostCountry: 'cn',
    recommendedLayout: 'linear',
  },
  {
    id: 'china-diplomatic',
    name: '中国外交场合',
    description: '与中国建交国家，按建交时间排序',
    icon: '🇨🇳',
    dataSource: 'china_diplomatic',
    rule: 'diplomatic-time',
    recommendedLayout: 'linear',
  },
  {
    id: 'eu-meeting',
    name: '欧盟会议',
    description: '欧盟成员国，英文字母顺序',
    icon: '🇪🇺',
    dataSource: 'euu',
    rule: 'alphabetical-en',
    recommendedLayout: 'u-shape',
  },
  {
    id: 'asia-conference',
    name: '亚洲会议',
    description: '亚洲国家，按大洲分组',
    icon: '🌏',
    dataSource: 'un',
    rule: 'continent-group',
    recommendedLayout: 'grid',
  },
];

/**
 * 初始化模块
 */
export function initSeatingModule(): void {
  if (moduleInitialized) {
    console.warn('⚠️ Seating module already initialized');
    return;
  }

  console.log('🪑 Initializing seating module...');

  // 渲染模板
  renderTemplates();

  // 绑定事件监听器
  setupEventListeners();

  moduleInitialized = true;
  console.log('✅ Seating module initialized');
}

/**
 * 渲染模板卡片
 */
function renderTemplates(): void {
  const container = document.getElementById('templates-grid');
  if (!container) return;

  container.innerHTML = '';

  PRESET_TEMPLATES.forEach((template) => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.dataset.templateId = template.id;

    card.innerHTML = `
      <span class="template-icon">${template.icon}</span>
      <div class="template-name">${template.name}</div>
      <div class="template-desc">${template.description}</div>
    `;

    card.addEventListener('click', () => applyTemplate(template));

    container.appendChild(card);
  });
}

/**
 * 应用模板
 */
function applyTemplate(template: SeatingTemplate): void {
  // 更新数据源
  currentDataSource = template.dataSource;
  const sourceSelect = document.getElementById('seating-source-select') as HTMLSelectElement;
  if (sourceSelect) {
    sourceSelect.value = template.dataSource;
  }

  // 更新排序规则
  currentConfig.rule = template.rule;
  const ruleSelect = document.getElementById('seating-rule-select') as HTMLSelectElement;
  if (ruleSelect) {
    ruleSelect.value = template.rule;
  }

  // 更新主办国（如果有）
  if (template.hostCountry) {
    currentConfig.hostCountry = template.hostCountry;
    const hostInput = document.getElementById('seating-host-input') as HTMLInputElement;
    if (hostInput) {
      hostInput.value = template.hostCountry;
    }
  }

  // 更新布局
  currentLayout = template.recommendedLayout;
  document.querySelectorAll('.layout-btn').forEach((btn) => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-layout') === template.recommendedLayout) {
      btn.classList.add('active');
    }
  });

  // 显示/隐藏配置项
  toggleConfigOptions();

  // 高亮选中的模板
  document.querySelectorAll('.template-card').forEach((card) => {
    card.classList.remove('active');
  });
  const selectedCard = document.querySelector(`[data-template-id="${template.id}"]`);
  if (selectedCard) {
    selectedCard.classList.add('active');
  }

  // 显示成功消息
  showMessage(`已应用模板：${template.name}`, 'success');
}

/**
 * 设置事件监听器
 */
function setupEventListeners(): void {
  // 工具卡片点击
  const seatingCard = document.getElementById('seating-tool-card');
  if (seatingCard) {
    seatingCard.addEventListener('click', showSeatingDetail);
  }

  // 返回按钮
  const backBtn = document.getElementById('backToToolsBtn');
  if (backBtn) {
    backBtn.addEventListener('click', backToTools);
  }

  // 数据源选择
  const sourceSelect = document.getElementById('seating-source-select') as HTMLSelectElement;
  if (sourceSelect) {
    sourceSelect.addEventListener('change', handleSourceChange);
  }

  // 排序规则选择
  const ruleSelect = document.getElementById('seating-rule-select') as HTMLSelectElement;
  if (ruleSelect) {
    ruleSelect.addEventListener('change', handleRuleChange);
  }

  // 主办国输入
  const hostInput = document.getElementById('seating-host-input') as HTMLInputElement;
  if (hostInput) {
    hostInput.addEventListener('input', handleHostChange);
  }

  // 布局选择
  const layoutButtons = document.querySelectorAll('.layout-btn');
  layoutButtons.forEach((btn) => {
    btn.addEventListener('click', handleLayoutChange);
  });

  // 生成排位按钮
  const generateBtn = document.getElementById('generate-seating-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateSeating);
  }

  // 导出按钮
  const exportTextBtn = document.getElementById('export-text-btn');
  const exportImageBtn = document.getElementById('export-image-btn');
  const copyBtn = document.getElementById('copy-seating-btn');

  if (exportTextBtn) exportTextBtn.addEventListener('click', () => exportSeating('text'));
  if (exportImageBtn) exportImageBtn.addEventListener('click', () => exportSeating('image'));
  if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
}

/**
 * 显示座位排位详细页面
 */
function showSeatingDetail(): void {
  const toolsSection = document.getElementById('tools-section');
  const seatingSection = document.getElementById('seating-detail-section');

  if (toolsSection) toolsSection.style.display = 'none';
  if (seatingSection) seatingSection.style.display = 'block';

  // 确保模板已渲染
  renderTemplates();
}

/**
 * 返回工具列表
 */
function backToTools(): void {
  const toolsSection = document.getElementById('tools-section');
  const seatingSection = document.getElementById('seating-detail-section');

  if (seatingSection) seatingSection.style.display = 'none';
  if (toolsSection) toolsSection.style.display = 'block';

  // 清理排位结果
  cleanup();
}

/**
 * 处理数据源变更
 */
function handleSourceChange(e: Event): void {
  const select = e.target as HTMLSelectElement;
  currentDataSource = select.value;
}

/**
 * 处理规则变更
 */
function handleRuleChange(e: Event): void {
  const select = e.target as HTMLSelectElement;
  currentConfig.rule = select.value as SeatingRule;

  // 显示/隐藏相关配置项
  toggleConfigOptions();
}

/**
 * 处理主办国变更
 */
function handleHostChange(e: Event): void {
  const input = e.target as HTMLInputElement;
  currentConfig.hostCountry = input.value.trim().toLowerCase();
}

/**
 * 处理布局变更
 */
function handleLayoutChange(e: Event): void {
  const btn = e.target as HTMLButtonElement;
  const layout = btn.dataset.layout as LayoutType;

  // 更新按钮状态
  document.querySelectorAll('.layout-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  currentLayout = layout;

  // 如果已有排位结果，重新渲染
  if (currentArrangement) {
    renderSeatingResult(currentArrangement);
  }
}

/**
 * 显示/隐藏配置选项
 */
function toggleConfigOptions(): void {
  const hostConfig = document.getElementById('host-config');
  const orgConfig = document.getElementById('org-config');

  if (hostConfig) {
    safeSetDisplay(
      hostConfig,
      currentConfig.rule === 'host-first' || currentConfig.rule === 'olympic'
    );
  }

  if (orgConfig) {
    safeSetDisplay(orgConfig, currentConfig.rule === 'organization-priority');
  }
}

/**
 * 生成座位排位
 */
function generateSeating(): void {
  // 根据数据源获取国家列表
  let countries: Country[] = [];

  if (currentDataSource === 'current') {
    // 使用当前浏览筛选结果
    countries = appState.getFilteredCountries();
    if (countries.length === 0) {
      showMessage('当前浏览没有筛选任何国家，请在"国旗浏览"中筛选或选择其他数据源', 'warning');
      return;
    }
  } else {
    // 使用选定的数据源
    const allCountries = getAllCountries();
    const sourceConfig = DATA_SOURCES[currentDataSource];

    if (!sourceConfig || !sourceConfig.countries) {
      showMessage('数据源配置错误', 'error');
      return;
    }

    countries = allCountries.filter((c) => sourceConfig.countries.includes(c.code));

    if (countries.length === 0) {
      showMessage(`${sourceConfig.name}数据暂无可用国家`, 'warning');
      return;
    }
  }

  // 执行排序
  const sortedCountries = applySortingRule([...countries], currentConfig);

  // 生成排位结果
  currentArrangement = {
    countries: sortedCountries,
    rule: currentConfig.rule,
    ruleDescription: getRuleDescription(currentConfig.rule),
    generatedAt: new Date(),
  };

  // 渲染结果
  renderSeatingResult(currentArrangement);

  // 显示结果区域
  const resultSection = document.getElementById('seating-result-section');
  if (resultSection) {
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * 应用排序规则
 */
function applySortingRule(countries: Country[], config: SeatingConfig): Country[] {
  switch (config.rule) {
    case 'alphabetical-en':
      return sortByAlphabeticalEN(countries);

    case 'alphabetical-cn':
      return sortByAlphabeticalCN(countries);

    case 'alphabetical-fr':
      return sortByAlphabeticalFR(countries);

    case 'host-first':
      return sortByHostFirst(countries, config.hostCountry);

    case 'olympic':
      return sortByOlympic(countries, config.hostCountry);

    case 'diplomatic-time':
      return sortByDiplomaticTime(countries);

    case 'continent-group':
      return sortByContinentGroup(countries);

    case 'organization-priority':
      return sortByOrganizationPriority(countries, config.priorityOrg);

    case 'custom':
      return sortByCustom(countries, config.pinnedCountries);

    default:
      return sortByAlphabeticalEN(countries);
  }
}

/**
 * 英文字母顺序
 */
function sortByAlphabeticalEN(countries: Country[]): Country[] {
  return countries.sort((a, b) => a.nameEN.localeCompare(b.nameEN, 'en'));
}

/**
 * 中文拼音顺序
 */
function sortByAlphabeticalCN(countries: Country[]): Country[] {
  return countries.sort((a, b) => a.nameCN.localeCompare(b.nameCN, 'zh-CN'));
}

/**
 * 法文字母顺序
 */
function sortByAlphabeticalFR(countries: Country[]): Country[] {
  return countries.sort((a, b) => frenchCollator.compare(a.nameEN, b.nameEN));
}

/**
 * 主办国优先
 */
function sortByHostFirst(countries: Country[], hostCode?: string): Country[] {
  if (!hostCode) return sortByAlphabeticalEN(countries);

  const host = countries.find((c) => c.code === hostCode);
  const others = countries.filter((c) => c.code !== hostCode);

  return host ? [host, ...sortByAlphabeticalEN(others)] : sortByAlphabeticalEN(countries);
}

/**
 * 奥运会模式（希腊第一，东道主最后，其余按英文字母）
 */
function sortByOlympic(countries: Country[], hostCode?: string): Country[] {
  const greece = countries.find((c) => c.code === 'gr'); // 希腊
  const host = hostCode ? countries.find((c) => c.code === hostCode) : null;

  const others = countries.filter((c) => c.code !== 'gr' && c.code !== hostCode);
  const sortedOthers = sortByAlphabeticalEN(others);

  const result: Country[] = [];
  if (greece) result.push(greece);
  result.push(...sortedOthers);
  if (host && host.code !== 'gr') result.push(host);

  return result;
}

/**
 * 按建交时间排序（与中国）
 */
function sortByDiplomaticTime(countries: Country[]): Country[] {
  return countries.sort((a, b) => {
    const timeA = diplomaticRelations[a.code];
    const timeB = diplomaticRelations[b.code];

    // 未建交的国家排在后面
    if (!timeA && !timeB) return a.nameEN.localeCompare(b.nameEN);
    if (!timeA) return 1;
    if (!timeB) return -1;

    // 比较建交时间
    return timeA.localeCompare(timeB);
  });
}

/**
 * 按大洲分组
 */
function sortByContinentGroup(countries: Country[]): Country[] {
  const continentOrder = ['亚洲', '欧洲', '非洲', '北美洲', '南美洲', '大洋洲', '南极洲'];

  return countries.sort((a, b) => {
    const continentCompare =
      continentOrder.indexOf(a.continent) - continentOrder.indexOf(b.continent);
    if (continentCompare !== 0) return continentCompare;

    // 同一大洲内按中文拼音排序
    return a.nameCN.localeCompare(b.nameCN, 'zh-CN');
  });
}

/**
 * 按国际组织成员优先
 */
function sortByOrganizationPriority(countries: Country[], priorityOrg?: string[]): Country[] {
  if (!priorityOrg || priorityOrg.length === 0) return sortByAlphabeticalEN(countries);

  const priority = countries.filter((c) => priorityOrg.includes(c.code));
  const others = countries.filter((c) => !priorityOrg.includes(c.code));

  return [...sortByAlphabeticalEN(priority), ...sortByAlphabeticalEN(others)];
}

/**
 * 自定义规则（置顶国家）
 */
function sortByCustom(countries: Country[], pinnedCodes?: string[]): Country[] {
  if (!pinnedCodes || pinnedCodes.length === 0) return sortByAlphabeticalEN(countries);

  const pinned: Country[] = [];
  const others: Country[] = [];

  // 按照置顶列表的顺序排列
  pinnedCodes.forEach((code) => {
    const country = countries.find((c) => c.code === code);
    if (country) pinned.push(country);
  });

  // 剩余国家按字母排序
  countries.forEach((country) => {
    if (!pinnedCodes.includes(country.code)) {
      others.push(country);
    }
  });

  return [...pinned, ...sortByAlphabeticalEN(others)];
}

/**
 * 获取规则描述
 */
function getRuleDescription(rule: SeatingRule): string {
  const descriptions: Record<SeatingRule, string> = {
    'alphabetical-en': '按英文名称字母顺序排列（联合国标准）',
    'alphabetical-cn': '按中文名称拼音顺序排列',
    'alphabetical-fr': '按法文名称字母顺序排列',
    'host-first': '主办国排在第一位，其余按英文字母顺序',
    olympic: '希腊第一，东道主最后，其余按英文字母顺序（奥运会标准）',
    'diplomatic-time': '按与中国建交时间先后排序',
    'continent-group': '按大洲分组，组内按中文拼音排序',
    'organization-priority': '国际组织成员优先，其余按字母顺序',
    custom: '自定义置顶国家，其余按字母顺序',
  };

  return descriptions[rule] || '未知规则';
}

/**
 * 渲染排位结果
 */
function renderSeatingResult(arrangement: SeatingArrangement): void {
  const container = document.getElementById('seating-display-container');
  if (!container) return;

  // 清空容器
  container.innerHTML = '';

  // 添加规则说明
  const ruleInfo = document.createElement('div');
  ruleInfo.className = 'seating-rule-info';
  ruleInfo.innerHTML = `
    <div class="rule-desc">
      <strong>排序规则：</strong>${arrangement.ruleDescription}
    </div>
    <div class="rule-meta">
      共 ${arrangement.countries.length} 个国家/地区 |
      生成时间：${arrangement.generatedAt.toLocaleString('zh-CN')}
    </div>
  `;
  container.appendChild(ruleInfo);

  // 根据布局类型渲染
  switch (currentLayout) {
    case 'linear':
      renderLinearLayout(container, arrangement.countries);
      break;
    case 'double-column':
      renderDoubleColumnLayout(container, arrangement.countries);
      break;
    case 'circular':
      renderCircularLayout(container, arrangement.countries);
      break;
    case 'u-shape':
      renderUShapeLayout(container, arrangement.countries);
      break;
    case 'grid':
      renderGridLayout(container, arrangement.countries);
      break;
  }
}

/**
 * 线性布局
 */
function renderLinearLayout(container: HTMLElement, countries: Country[]): void {
  const list = document.createElement('div');
  list.className = 'seating-linear-layout';

  countries.forEach((country, index) => {
    const item = createSeatingItem(country, index + 1);
    list.appendChild(item);
  });

  container.appendChild(list);
}

/**
 * 双列对称布局
 */
function renderDoubleColumnLayout(container: HTMLElement, countries: Country[]): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'seating-double-column-layout';

  const leftColumn = document.createElement('div');
  leftColumn.className = 'column column-left';

  const rightColumn = document.createElement('div');
  rightColumn.className = 'column column-right';

  countries.forEach((country, index) => {
    const item = createSeatingItem(country, index + 1);
    if (index % 2 === 0) {
      leftColumn.appendChild(item);
    } else {
      rightColumn.appendChild(item);
    }
  });

  wrapper.appendChild(leftColumn);
  wrapper.appendChild(rightColumn);
  container.appendChild(wrapper);
}

/**
 * 圆桌布局
 */
function renderCircularLayout(container: HTMLElement, countries: Country[]): void {
  const circle = document.createElement('div');
  circle.className = 'seating-circular-layout';

  const radius = 200; // 圆的半径
  const centerX = 250;
  const centerY = 250;

  countries.forEach((country, index) => {
    const angle = (index / countries.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const item = createSeatingItem(country, index + 1);
    item.style.position = 'absolute';
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    item.style.transform = 'translate(-50%, -50%)';

    circle.appendChild(item);
  });

  circle.style.position = 'relative';
  circle.style.width = '500px';
  circle.style.height = '500px';
  circle.style.margin = '0 auto';

  container.appendChild(circle);
}

/**
 * U型布局
 */
function renderUShapeLayout(container: HTMLElement, countries: Country[]): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'seating-u-shape-layout';

  const topRow = document.createElement('div');
  topRow.className = 'u-row u-top';

  const leftRow = document.createElement('div');
  leftRow.className = 'u-row u-left';

  const rightRow = document.createElement('div');
  rightRow.className = 'u-row u-right';

  const total = countries.length;
  const topCount = Math.ceil(total / 3);
  const leftCount = Math.floor((total - topCount) / 2);
  const rightCount = total - topCount - leftCount;

  countries.forEach((country, index) => {
    const item = createSeatingItem(country, index + 1);

    if (index < topCount) {
      topRow.appendChild(item);
    } else if (index < topCount + leftCount) {
      leftRow.appendChild(item);
    } else {
      rightRow.appendChild(item);
    }
  });

  wrapper.appendChild(topRow);
  const sideWrapper = document.createElement('div');
  sideWrapper.className = 'u-sides';
  sideWrapper.appendChild(leftRow);
  sideWrapper.appendChild(rightRow);
  wrapper.appendChild(sideWrapper);

  container.appendChild(wrapper);
}

/**
 * 网格布局
 */
function renderGridLayout(container: HTMLElement, countries: Country[]): void {
  const grid = document.createElement('div');
  grid.className = 'seating-grid-layout';

  countries.forEach((country, index) => {
    const item = createSeatingItem(country, index + 1);
    grid.appendChild(item);
  });

  container.appendChild(grid);
}

/**
 * 创建座位项
 */
function createSeatingItem(country: Country, position: number): HTMLElement {
  const item = document.createElement('div');
  item.className = 'seating-item';

  // 添加特殊排位样式
  if (position === 1) {
    item.classList.add('rank-1');
  } else if (position === 2) {
    item.classList.add('rank-2');
  } else if (position === 3) {
    item.classList.add('rank-3');
  }

  const flagImg = document.createElement('img');
  flagImg.src = getFlagImageUrl(country.code);
  flagImg.alt = country.nameCN;
  flagImg.className = 'seating-flag';

  const info = document.createElement('div');
  info.className = 'seating-info';

  const positionEl = document.createElement('div');
  positionEl.className = 'seating-position';
  positionEl.textContent = `${position}`;

  const namesWrapper = document.createElement('div');
  namesWrapper.className = 'seating-names';

  const namesCN = document.createElement('div');
  namesCN.className = 'seating-name-cn';
  namesCN.textContent = country.nameCN;

  const namesEN = document.createElement('div');
  namesEN.className = 'seating-name-en';
  namesEN.textContent = country.nameEN;

  namesWrapper.appendChild(namesCN);
  namesWrapper.appendChild(namesEN);

  info.appendChild(positionEl);
  info.appendChild(namesWrapper);

  item.appendChild(flagImg);
  item.appendChild(info);

  return item;
}

/**
 * 导出排位结果
 */
function exportSeating(format: 'text' | 'image'): void {
  if (!currentArrangement) {
    showMessage('请先生成排位结果', 'warning');
    return;
  }

  if (format === 'text') {
    exportAsText();
  } else if (format === 'image') {
    exportAsImage();
  }
}

/**
 * 导出为文本
 */
function exportAsText(): void {
  if (!currentArrangement) return;

  let text = `座位排位结果\n`;
  text += `规则：${currentArrangement.ruleDescription}\n`;
  text += `生成时间：${currentArrangement.generatedAt.toLocaleString('zh-CN')}\n`;
  text += `共 ${currentArrangement.countries.length} 个国家/地区\n\n`;

  currentArrangement.countries.forEach((country, index) => {
    text += `${index + 1}. ${country.nameCN} (${country.nameEN})\n`;
  });

  // 创建下载链接
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `座位排位_${new Date().getTime()}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  showMessage('已导出为文本文件', 'success');
}

/**
 * 导出为图片
 */
function exportAsImage(): void {
  showMessage('图片导出功能即将推出', 'info');
  // TODO: 使用 html2canvas 或类似库实现
}

/**
 * 复制到剪贴板
 */
function copyToClipboard(): void {
  if (!currentArrangement) {
    showMessage('请先生成排位结果', 'warning');
    return;
  }

  let text = '';
  currentArrangement.countries.forEach((country, index) => {
    text += `${index + 1}. ${country.nameCN} (${country.nameEN})\n`;
  });

  navigator.clipboard
    .writeText(text)
    .then(() => {
      showMessage('已复制到剪贴板', 'success');
    })
    .catch(() => {
      showMessage('复制失败，请手动复制', 'error');
    });
}

/**
 * 显示消息
 */
function showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
  // 创建消息元素
  const msgEl = document.createElement('div');
  msgEl.className = `seating-message seating-message-${type}`;
  msgEl.textContent = message;

  // 添加到页面
  document.body.appendChild(msgEl);

  // 3秒后移除
  setTimeout(() => {
    msgEl.remove();
  }, 3000);
}

/**
 * 清理模块
 */
export function cleanup(): void {
  // 清空结果显示
  const resultSection = document.getElementById('seating-result-section');
  if (resultSection) {
    resultSection.style.display = 'none';
  }

  const container = document.getElementById('seating-display-container');
  if (container) {
    container.innerHTML = '';
  }

  // 清除模板选中状态
  document.querySelectorAll('.template-card').forEach((card) => {
    card.classList.remove('active');
  });

  // 重置状态
  currentArrangement = null;
}

/**
 * 导出模块对象
 */
export const seatingModule = {
  init: initSeatingModule,
  cleanup,
  generateSeating,
  exportSeating,
  copyToClipboard,
};
