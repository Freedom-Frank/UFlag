/**
 * 应用状态管理模块
 */

import type { Country, DataSource, SortOrder, FilterOptions } from '../types';
import { DEFAULT_CONTINENT, DEFAULT_SORT_METHOD, DEFAULT_DATA_SOURCE } from './constants';

/** 应用状态接口 */
export interface AppState {
  // 数据
  allCountries: Country[];
  filteredCountries: Country[];

  // 当前页面
  currentSection: 'browse' | 'memory' | 'quiz' | 'globe' | 'stats';

  // 筛选条件
  selectedContinent: string;
  selectedStyles: Set<string>;
  searchTerm: string;
  selectedDataSource: DataSource | 'all';

  // 排序
  sortMethod: SortOrder | string;
}

/** 状态变化监听器 */
type StateChangeListener = (state: AppState) => void;

/** 全局应用状态 */
class StateManager {
  private state: AppState = {
    allCountries: [],
    filteredCountries: [],
    currentSection: 'browse',
    selectedContinent: DEFAULT_CONTINENT,
    selectedStyles: new Set(),
    searchTerm: '',
    selectedDataSource: DEFAULT_DATA_SOURCE,
    sortMethod: DEFAULT_SORT_METHOD,
  };

  private listeners: Set<StateChangeListener> = new Set();

  /** 获取当前状态 */
  getState(): AppState {
    return { ...this.state };
  }

  /** 更新状态 */
  setState(partialState: Partial<AppState>): void {
    this.state = {
      ...this.state,
      ...partialState,
    };
    this.notifyListeners();
  }

  /** 设置所有国家数据 */
  setAllCountries(countries: Country[]): void {
    this.setState({
      allCountries: countries,
      filteredCountries: countries, // 初始时显示全部
    });
  }

  /** 设置筛选后的国家 */
  setFilteredCountries(countries: Country[]): void {
    this.setState({ filteredCountries: countries });
  }

  /** 切换页面 */
  setCurrentSection(section: AppState['currentSection']): void {
    this.setState({ currentSection: section });
  }

  /** 设置选中的大洲 */
  setSelectedContinent(continent: string): void {
    this.setState({ selectedContinent: continent });
  }

  /** 切换特征选择 */
  toggleStyle(style: string): void {
    const styles = new Set(this.state.selectedStyles);
    if (styles.has(style)) {
      styles.delete(style);
    } else {
      styles.add(style);
    }
    this.setState({ selectedStyles: styles });
  }

  /** 清除所有特征选择 */
  clearStyles(): void {
    this.setState({ selectedStyles: new Set() });
  }

  /** 设置搜索关键词 */
  setSearchTerm(term: string): void {
    this.setState({ searchTerm: term });
  }

  /** 设置数据源 */
  setDataSource(source: DataSource | 'all'): void {
    this.setState({ selectedDataSource: source });
  }

  /** 设置排序方式 */
  setSortMethod(method: SortOrder | string): void {
    this.setState({ sortMethod: method });
  }

  /** 获取筛选选项 */
  getFilterOptions(): FilterOptions {
    return {
      continent: this.state.selectedContinent === 'all' ? undefined : this.state.selectedContinent,
      search: this.state.searchTerm || undefined,
    };
  }

  /** 重置筛选条件 */
  resetFilters(): void {
    this.setState({
      selectedContinent: DEFAULT_CONTINENT,
      selectedStyles: new Set(),
      searchTerm: '',
      selectedDataSource: DEFAULT_DATA_SOURCE,
    });
  }

  /** 订阅状态变化 */
  subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** 通知所有监听器 */
  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /** 调试：打印当前状态 */
  debug(): void {
    console.log('Current App State:', {
      ...this.state,
      selectedStyles: Array.from(this.state.selectedStyles),
      countriesCount: {
        all: this.state.allCountries.length,
        filtered: this.state.filteredCountries.length,
      },
    });
  }
}

// 创建全局状态管理器实例
export const appState = new StateManager();

// 导出到全局（用于调试和兼容性）
if (typeof window !== 'undefined') {
  (window as any).appState = appState;
}

/** 便捷的状态访问函数 */
export function getCurrentState(): AppState {
  return appState.getState();
}

export function getAllCountries(): Country[] {
  return appState.getState().allCountries;
}

export function getFilteredCountries(): Country[] {
  return appState.getState().filteredCountries;
}

export function getCurrentSection(): AppState['currentSection'] {
  return appState.getState().currentSection;
}
