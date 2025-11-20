/**
 * 工具管理器
 * 统一管理实用工具的切换、初始化和清理
 */

import { flagRecognitionModule } from '../modules/flag-recognition';
import { seatingModule } from '../modules/seating';

export type ToolType = 'flag-recognition' | 'seating' | null;

/**
 * 工具管理器类
 */
export class ToolManager {
  private currentTool: ToolType = null;
  private initializedTools: Set<ToolType> = new Set();

  /**
   * 初始化指定工具
   */
  async initializeTool(tool: ToolType): Promise<void> {
    if (!tool) return;

    try {
      switch (tool) {
        case 'flag-recognition':
          if (!this.initializedTools.has('flag-recognition')) {
            await flagRecognitionModule.initModule();
            this.initializedTools.add('flag-recognition');
            console.log('✅ 国旗识别工具初始化完成');
          }
          break;

        case 'seating':
          if (!this.initializedTools.has('seating')) {
            // 座位排位模块在 app.ts 中已经初始化，这里只需要确认
            this.initializedTools.add('seating');
            console.log('✅ 座位排位工具已准备就绪');
          }
          break;
      }
    } catch (error) {
      console.error(`❌ ${tool} 工具初始化失败:`, error);
      throw error;
    }
  }

  /**
   * 切换到指定工具
   */
  async switchToTool(tool: ToolType): Promise<void> {
    console.log(`🔄 请求切换到工具: ${tool || '工具列表'}`);
    if (this.currentTool === tool) {
      console.log(`🔄 工具 ${tool} 已经是当前活跃工具`);
      return;
    }

    try {
      // 先清理当前工具
      await this.cleanupCurrentTool();

      // 初始化新工具
      if (tool) {
        console.log(`🔧 开始初始化工具: ${tool}`);
        await this.initializeTool(tool);
      }

      // 显示新工具界面
      console.log(`🖼️ 开始显示工具界面: ${tool || '工具列表'}`);
      this.showToolInterface(tool);

      this.currentTool = tool;
      console.log(`✅ 已切换到工具: ${tool || '工具列表'}`);
    } catch (error) {
      console.error(`❌ 切换到工具 ${tool} 失败:`, error);
      // 出错时回退到工具列表
      this.showToolInterface(null);
      this.currentTool = null;
    }
  }

  /**
   * 清理当前活跃的工具
   */
  async cleanupCurrentTool(): Promise<void> {
    if (!this.currentTool) return;

    try {
      switch (this.currentTool) {
        case 'flag-recognition':
          flagRecognitionModule.backToTools();
          console.log('🧹 国旗识别工具已清理');
          break;

        case 'seating':
          seatingModule.cleanup();
          console.log('🧹 座位排位工具已清理');
          break;
      }
    } catch (error) {
      console.error(`❌ 清理工具 ${this.currentTool} 失败:`, error);
    }
  }

  /**
   * 显示工具界面
   */
  private showToolInterface(tool: ToolType): void {
    // 隐藏所有工具详情页面
    const flagRecognitionDetail = document.getElementById('flag-recognition-detail');
    const seatingDetail = document.getElementById('seating-detail-section');
    const toolsMain = document.getElementById('tools-section');

    console.log(`🔍 查找DOM元素: flag-recognition-detail=${!!flagRecognitionDetail}, seating-detail-section=${!!seatingDetail}, tools-section=${!!toolsMain}`);

    // 先隐藏所有详情页面
    if (flagRecognitionDetail) {
      flagRecognitionDetail.style.display = 'none';
    }
    if (seatingDetail) {
      seatingDetail.style.display = 'none';
    }

    // 根据工具类型显示对应界面
    switch (tool) {
      case 'flag-recognition':
        // 使用国旗识别模块的显示函数，延迟以确保DOM准备好
        setTimeout(() => {
          flagRecognitionModule.showRecognitionDetail();
        }, 50);
        break;

      case 'seating':
        // 使用座位排位模块的显示函数，延迟以确保DOM准备好
        setTimeout(() => {
          seatingModule.showDetail();
        }, 50);
        break;

      case null:
      default:
        // 显示工具列表
        if (toolsMain) {
          toolsMain.style.display = 'block';
        }
        break;
    }
  }

  /**
   * 返回工具列表
   */
  async backToToolsList(): Promise<void> {
    await this.switchToTool(null);
  }

  /**
   * 初始化工具页面
   */
  async initializeToolsPage(): Promise<void> {
    // 确保国旗识别模块已初始化
    await this.initializeTool('flag-recognition');
  }

  /**
   * 获取当前活跃工具
   */
  getCurrentTool(): ToolType {
    return this.currentTool;
  }

  /**
   * 检查工具是否已初始化
   */
  isToolInitialized(tool: ToolType): boolean {
    return tool ? this.initializedTools.has(tool) : false;
  }

  /**
   * 重置所有工具状态
   */
  reset(): void {
    this.currentTool = null;
    this.initializedTools.clear();
    console.log('🔄 工具管理器已重置');
  }
}

// 创建单例实例
export const toolManager = new ToolManager();

// 向后兼容：导出到全局
if (typeof window !== 'undefined') {
  (window as any).toolManager = toolManager;
}