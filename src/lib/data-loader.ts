/**
 * 数据加载模块
 */

import type { Country, Translations, FlagFeaturesData, ColorFeature } from '../types';
import { DATA_PATHS } from './constants';

/**
 * 加载国家数据
 */
export async function loadCountries(): Promise<Country[]> {
  try {
    const response = await fetch(DATA_PATHS.countries);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // 数据文件格式为 { "countries": [...] }
    return (data.countries || data) as Country[];
  } catch (error) {
    console.error('Failed to load countries data:', error);
    return [];
  }
}

/**
 * 加载翻译数据
 */
export async function loadTranslations(): Promise<Translations> {
  try {
    const response = await fetch(DATA_PATHS.i18n);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as Translations;
  } catch (error) {
    console.error('Failed to load translations data:', error);
    return { zh: {}, en: {} };
  }
}

/**
 * 从文本文件加载国家列表
 */
export async function loadCountryList(filename: string): Promise<string[]> {
  try {
    const response = await fetch(`/data/lists/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (error) {
    console.error(`Failed to load country list from ${filename}:`, error);
    return [];
  }
}

/**
 * 加载 GeoJSON 数据
 */
export async function loadGeoJSON(filename: string): Promise<any> {
  try {
    const response = await fetch(`/assets/geo/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to load GeoJSON from ${filename}:`, error);
    return null;
  }
}

/**
 * 预加载图片
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 批量预加载国旗图片
 */
export async function preloadFlags(countryCodes: string[]): Promise<void> {
  const imagePromises = countryCodes.map((code) =>
    preloadImage(`./assets/images/flags/${code}.png`).catch((error) => {
      console.warn(`Failed to preload flag for ${code}:`, error);
    })
  );

  try {
    await Promise.all(imagePromises);
    console.log(`Preloaded ${countryCodes.length} flag images`);
  } catch (error) {
    console.error('Failed to preload some flags:', error);
  }
}

/**
 * 获取国旗图片URL
 */
export function getFlagImageUrl(countryCode: string): string {
  return `/assets/images/flags/${countryCode}.png`;
}

/**
 * 检查资源是否可用
 */
export async function checkResourceAvailable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// ========== 国旗特征相关功能 ==========

// 缓存特征数据
let flagFeaturesCache: FlagFeaturesData | null = null;

/**
 * 加载国旗特征数据
 */
export async function loadFlagFeatures(): Promise<FlagFeaturesData> {
  if (flagFeaturesCache) {
    return flagFeaturesCache;
  }

  try {
    const response = await fetch('/data/flag-features.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    flagFeaturesCache = data as FlagFeaturesData;

    console.log(`已加载 ${Object.keys(data.features).length} 个国旗特征`);
    return flagFeaturesCache;
  } catch (error) {
    console.warn('加载国旗特征数据失败，将使用实时计算:', error);
    // 返回空的特征数据，识别模块会回退到实时计算
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalCountries: 0,
        processedCount: 0,
        errorCount: 0,
        version: '1.0.0'
      },
      features: {}
    };
  }
}

/**
 * 获取指定国家的国旗特征
 */
export async function getFlagFeature(countryCode: string): Promise<ColorFeature | null> {
  if (!flagFeaturesCache) {
    await loadFlagFeatures();
  }

  if (flagFeaturesCache && flagFeaturesCache.features[countryCode]) {
    const feature = flagFeaturesCache.features[countryCode];
    return {
      dominant: feature.dominant,
      distribution: feature.distribution,
      layout: feature.layout as 'horizontal' | 'vertical' | 'complex' | 'unknown'
    };
  }

  return null;
}

/**
 * 获取所有已加载的国旗特征
 */
export function getAllFlagFeatures(): Record<string, ColorFeature> {
  if (!flagFeaturesCache) {
    return {};
  }

  const result: Record<string, ColorFeature> = {};
  for (const [code, feature] of Object.entries(flagFeaturesCache.features)) {
    result[code] = {
      dominant: feature.dominant,
      distribution: feature.distribution,
      layout: feature.layout as 'horizontal' | 'vertical' | 'complex' | 'unknown'
    };
  }

  return result;
}

/**
 * 检查特征数据是否已加载
 */
export function isFlagFeaturesLoaded(): boolean {
  return flagFeaturesCache !== null;
}

/**
 * 清除特征数据缓存
 */
export function clearFlagFeaturesCache(): void {
  flagFeaturesCache = null;
}
