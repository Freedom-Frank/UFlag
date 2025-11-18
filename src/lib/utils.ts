/**
 * UFlag 工具函数集合
 */

import type { Country } from '../types';

/**
 * 安全地设置元素的文本内容
 */
export function safeSetText(id: string, text: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

/**
 * 安全地设置元素的类名
 */
export function safeSetClass(id: string, className: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.className = className;
  }
}

/**
 * 安全地设置元素的显示状态
 */
export function safeSetDisplay(id: string, display: string): void {
  const element = document.getElementById(id) as HTMLElement;
  if (element) {
    element.style.display = display;
  }
}

/**
 * 安全地添加事件监听器
 */
export function safeAddEventListener(id: string, event: string, handler: EventListener): void {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener(event, handler);
  }
}

/**
 * 格式化时间（秒 -> MM:SS）
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 从数组中随机获取指定数量的元素
 */
export function getRandomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * 打乱数组顺序
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 获取嵌套对象的值
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 按名称排序国家（支持中英文）
 */
export function sortCountriesByName(countries: Country[], ascending = true): Country[] {
  return [...countries].sort((a, b) => {
    const nameA = a.nameCN;
    const nameB = b.nameCN;
    return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
}

/**
 * 按大洲分组国家
 */
export function groupCountriesByContinent(countries: Country[]): Record<string, Country[]> {
  const grouped: Record<string, Country[]> = {};
  countries.forEach((country) => {
    const continent = country.continent;
    if (!grouped[continent]) {
      grouped[continent] = [];
    }
    grouped[continent].push(country);
  });
  return grouped;
}

/**
 * 计算准确率
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 检查元素是否在视口中
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 平滑滚动到元素
 */
export function smoothScrollTo(element: HTMLElement): void {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}
