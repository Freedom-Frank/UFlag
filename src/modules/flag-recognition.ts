import { loadCountries, getFlagImageUrl, loadFlagFeatures, getAllFlagFeatures } from '../lib/data-loader';
import { Country, ColorFeature } from '../types';
import { i18n } from '../lib/i18n-core';
import { toolManager } from '../lib/tool-manager';

interface RecognitionResult {
  country: Country;
  confidence: number;
  matches: string[];
}

export class FlagRecognitionModule {
  private initialized = false;
  private countries: Country[] = [];
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;
  private flagFeatures: Record<string, ColorFeature> = {};
  private usePrecomputedFeatures = false;

  async initModule(): Promise<void> {
    if (this.initialized) return;

    try {
      // 加载国家数据
      this.countries = await loadCountries();

      // 尝试加载预计算的特征数据
      try {
        const featuresData = await loadFlagFeatures();
        if (featuresData.metadata.processedCount > 0) {
          this.flagFeatures = getAllFlagFeatures();
          this.usePrecomputedFeatures = true;
          console.log(`已加载 ${featuresData.metadata.processedCount} 个预计算的国旗特征`);
        }
      } catch (error) {
        console.warn('无法加载预计算特征，将使用实时计算:', error);
        this.usePrecomputedFeatures = false;
      }

      // 绑定事件监听器
      this.bindEventListeners();

      this.initialized = true;
      console.log('国旗识别模块初始化完成');
    } catch (error) {
      console.error('国旗识别模块初始化失败:', error);
      this.showError('初始化失败，请刷新页面重试');
    }
  }

  private bindEventListeners(): void {
    // 拍照按钮
    const captureBtn = document.getElementById('capture-photo-btn');
    if (captureBtn) {
      captureBtn.addEventListener('click', () => this.capturePhoto());
    }

    // 上传文件按钮
    const uploadBtn = document.getElementById('upload-photo-btn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.triggerFileUpload());
    }

    // 文件输入变化
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    // 开始摄像头按钮
    const startCameraBtn = document.getElementById('start-camera-btn');
    if (startCameraBtn) {
      startCameraBtn.addEventListener('click', () => this.startCamera());
    }

    // 停止摄像头按钮
    const stopCameraBtn = document.getElementById('stop-camera-btn');
    if (stopCameraBtn) {
      stopCameraBtn.addEventListener('click', () => this.stopCamera());
    }

    // 重新拍摄按钮
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.retryCapture());
    }

    // 返回工具列表按钮
    const backToToolsBtn = document.getElementById('back-to-tools-btn');
    if (backToToolsBtn) {
      backToToolsBtn.addEventListener('click', () => {
        toolManager.backToToolsList();
      });
    }

    // 国旗识别工具卡片点击事件
    const flagRecognitionTool = document.getElementById('flag-recognition-tool');
    if (flagRecognitionTool) {
      flagRecognitionTool.addEventListener('click', () => {
        toolManager.switchToTool('flag-recognition');
      });
    }
  }

  async startCamera(): Promise<void> {
    try {
      // 首先清理之前的识别结果和状态
      this.clearPreviousResults();
      
      // 隐藏预览容器（如果有上传的图片预览）
      const previewContainer = document.getElementById('preview-container');
      if (previewContainer) {
        previewContainer.style.display = 'none';
      }

      // 重置文件输入
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      const video = document.getElementById('camera-video') as HTMLVideoElement;
      if (!video) {
        throw new Error('摄像头视频元素未找到');
      }

      this.videoElement = video;

      // 请求摄像头权限
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      video.srcObject = this.stream;

      // 显示摄像头控制按钮
      this.showCameraControls();

      console.log('摄像头启动成功');
    } catch (error) {
      console.error('摄像头启动失败:', error);
      this.showError('无法访问摄像头，请检查权限设置');
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.hideCameraControls();
    console.log('摄像头已停止');
  }

  async capturePhoto(): Promise<void> {
    if (!this.videoElement) {
      this.showError('摄像头未启动');
      return;
    }

    try {
      const canvas = document.getElementById('photo-canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('画布元素未找到');
      }

      this.canvasElement = canvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取画布上下文');
      }

      // 设置画布尺寸
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;

      // 绘制当前视频帧到画布
      ctx.drawImage(this.videoElement, 0, 0);

      // 获取图像数据
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // 显示捕获的图像
      this.displayCapturedImage(imageData);

      // 停止摄像头
      this.stopCamera();

      // 开始识别
      await this.identifyFlag(imageData);

    } catch (error) {
      console.error('拍照失败:', error);
      this.showError('拍照失败，请重试');
    }
  }

  triggerFileUpload(): void {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  async handleFileUpload(event: Event): Promise<void> {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      this.showError('请选择图片文件');
      return;
    }

    // 验证文件大小 (最大10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showError('图片文件过大，请选择小于10MB的图片');
      return;
    }

    try {
      const imageData = await this.fileToDataURL(file);
      this.displayCapturedImage(imageData);
      await this.identifyFlag(imageData);
    } catch (error) {
      console.error('文件处理失败:', error);
      this.showError('图片处理失败，请重试');
    }
  }

  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('文件读取失败'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private displayCapturedImage(imageData: string): void {
    const preview = document.getElementById('captured-preview') as HTMLImageElement;
    const previewContainer = document.getElementById('preview-container');

    if (preview && previewContainer) {
      preview.src = imageData;
      previewContainer.style.display = 'block';
    }
  }

  private async identifyFlag(imageData: string): Promise<void> {
    this.showLoading(true);

    try {
      // 提取上传图片的特征
      const uploadFeature = await this.extractImageFeatures(imageData);

      // 与所有国旗进行匹配
      const results = await this.matchWithFlags(uploadFeature);

      console.log(`🔍 识别结果: 找到 ${results.length} 个匹配项`);
      console.log('📊 所有结果:', results.map(r => `${r.country.code}: ${Math.round(r.confidence * 100)}%`));

      // 强制显示结果，即使为空也显示提示
      this.displayResults(results);

    } catch (error) {
      console.error('国旗识别失败:', error);
      this.showError('识别失败，请尝试使用更清晰的图片');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * 清理之前的识别结果和显示状态
   */
  private clearPreviousResults(): void {
    // 隐藏结果和提示
    const resultsContainer = document.getElementById('recognition-results');
    const noResults = document.getElementById('no-results');
    const cameraContainer = document.getElementById('camera-container');

    console.log('🧹 清理之前的识别结果');

    if (resultsContainer) {
      resultsContainer.style.display = 'none';
      resultsContainer.innerHTML = ''; // 清空内容
    }
    if (noResults) {
      noResults.style.display = 'none';
    }

    // 只有在摄像头正在运行时才隐藏摄像头容器
    if (cameraContainer && this.stream) {
      console.log('📷 隐藏摄像头容器（摄像头正在运行）');
      cameraContainer.style.display = 'none';
    }

    // 注意：不清理 preview-container，因为上传图片的预览应该保持显示
  }

  private async extractImageFeatures(imageData: string): Promise<ColorFeature> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法创建画布上下文'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const feature = this.analyzeColorFeatures(imageData);

          resolve(feature);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = imageData;
    });
  }

  private analyzeColorFeatures(imageData: ImageData): ColorFeature {
    const data = imageData.data;
    const colorMap = new Map<string, number>();

    // 分析颜色分布
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.floor(data[i] / 51) * 51;  // 简化颜色空间
      const g = Math.floor(data[i + 1] / 51) * 51;
      const b = Math.floor(data[i + 2] / 51) * 51;
      const color = `${r},${g},${b}`;

      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }

    // 获取主要颜色
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => `rgb(${color})`);

    // 计算颜色分布百分比
    const totalPixels = imageData.width * imageData.height;
    const distribution = Array.from(colorMap.values())
      .sort((a, b) => b - a)
      .slice(0, 5)
      .map(count => count / totalPixels);

    // 简单的布局检测
    const layout = this.detectLayout(imageData);

    return {
      dominant: sortedColors,
      distribution,
      layout
    };
  }

  private detectLayout(imageData: ImageData): 'horizontal' | 'vertical' | 'complex' | 'unknown' {
    const { data, width, height } = imageData;

    // 简单的布局检测算法
    // 检查水平条纹
    const horizontalRows = [];
    for (let y = 0; y < height; y += Math.floor(height / 10)) {
      let rowColor = '';
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = Math.floor(data[i] / 51) * 51;
        const g = Math.floor(data[i + 1] / 51) * 51;
        const b = Math.floor(data[i + 2] / 51) * 51;
        rowColor += `${r},${g},${b},`;
      }
      horizontalRows.push(rowColor);
    }

    const uniqueHorizontalRows = new Set(horizontalRows).size;

    if (uniqueHorizontalRows <= 3) {
      return 'horizontal';
    }

    // 检查垂直条纹
    const verticalCols = [];
    for (let x = 0; x < width; x += Math.floor(width / 10)) {
      let colColor = '';
      for (let y = 0; y < height; y++) {
        const i = (y * width + x) * 4;
        const r = Math.floor(data[i] / 51) * 51;
        const g = Math.floor(data[i + 1] / 51) * 51;
        const b = Math.floor(data[i + 2] / 51) * 51;
        colColor += `${r},${g},${b},`;
      }
      verticalCols.push(colColor);
    }

    const uniqueVerticalCols = new Set(verticalCols).size;

    if (uniqueVerticalCols <= 3) {
      return 'vertical';
    }

    return 'complex';
  }

  private async matchWithFlags(uploadFeature: ColorFeature): Promise<RecognitionResult[]> {
    const results: RecognitionResult[] = [];

    if (this.usePrecomputedFeatures) {
      // 使用预计算特征 - 快速匹配
      console.log('使用预计算特征进行快速匹配...');

      for (const country of this.countries) {
        try {
          const flagFeature = this.flagFeatures[country.code];

          if (!flagFeature) {
            console.warn(`未找到国家 ${country.code} 的预计算特征`);
            continue;
          }

          // 计算相似度
          const confidence = this.calculateSimilarity(uploadFeature, flagFeature);

          if (confidence > 0.1) { // 降低阈值到10%，提高识别率
            console.log(`🎯 国家 ${country.code}: 相似度 ${Math.round(confidence * 100)}%`);
            results.push({
              country,
              confidence,
              matches: this.getMatchReasons(uploadFeature, flagFeature)
            });
          }
        } catch (error) {
          console.warn(`分析国旗 ${country.code} 失败:`, error);
        }
      }
    } else {
      // 实时计算 - 慢速匹配（备用方案）
      console.log('使用实时计算进行匹配...');

      for (const country of this.countries) {
        try {
          // 获取国旗图片并提取特征
          const flagUrl = getFlagImageUrl(country.code);
          const flagFeature = await this.extractImageFeatures(flagUrl);

          // 计算相似度
          const confidence = this.calculateSimilarity(uploadFeature, flagFeature);

          if (confidence > 0.1) { // 降低阈值到10%，提高识别率
            console.log(`🎯 国家 ${country.code}: 相似度 ${Math.round(confidence * 100)}%`);
            results.push({
              country,
              confidence,
              matches: this.getMatchReasons(uploadFeature, flagFeature)
            });
          }
        } catch (error) {
          console.warn(`分析国旗 ${country.code} 失败:`, error);
        }
      }
    }

    // 按相似度排序，返回前5个结果
    return results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private calculateSimilarity(feature1: ColorFeature, feature2: ColorFeature): number {
    // 颜色相似度计算
    let colorScore = 0;
    const maxColors = Math.min(feature1.dominant.length, feature2.dominant.length);

    for (let i = 0; i < maxColors; i++) {
      if (this.isColorSimilar(feature1.dominant[i], feature2.dominant[i])) {
        colorScore += (maxColors - i) / maxColors;
      }
    }

    // 布局相似度
    const layoutScore = feature1.layout === feature2.layout ? 1 : 0.5;

    // 综合评分
    return (colorScore * 0.7 + layoutScore * 0.3);
  }

  private isColorSimilar(color1: string, color2: string): boolean {
    const rgb1 = color1.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const rgb2 = color2.match(/\d+/g)?.map(Number) || [0, 0, 0];

    const distance = Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );

    return distance < 100; // 颜色距离阈值
  }

  private getMatchReasons(uploadFeature: ColorFeature, flagFeature: ColorFeature): string[] {
    const reasons: string[] = [];

    if (uploadFeature.layout === flagFeature.layout) {
      reasons.push('布局相似');
    }

    if (this.isColorSimilar(uploadFeature.dominant[0], flagFeature.dominant[0])) {
      reasons.push('主要颜色匹配');
    }

    return reasons;
  }

  private displayResults(results: RecognitionResult[]): void {
    const resultsContainer = document.getElementById('recognition-results');
    const noResults = document.getElementById('no-results');

    if (!resultsContainer || !noResults) {
      console.error('❌ 找不到结果显示容器');
      return;
    }

    console.log(`🖼️ 开始显示识别结果: ${results.length} 个结果`);

    // 先清理之前的结果
    this.clearPreviousResults();

    if (results.length === 0) {
      console.log('⚠️ 没有找到匹配的国旗');
      console.log('🔍 调试信息: resultsContainer存在?', !!resultsContainer);
      console.log('🔍 调试信息: noResults存在?', !!noResults);

      resultsContainer.style.display = 'none';
      noResults.style.display = 'block';

      console.log('🔍 设置noResults显示后, 实际display:', noResults.style.display);
      return;
    }

    // 确保容器可见
    resultsContainer.style.display = 'block';
    noResults.style.display = 'none';

    // 清空之前的结果内容
    resultsContainer.innerHTML = '';

    // 添加结果标题
    const title = document.createElement('h3');
    title.textContent = i18n.t('recognition.results');
    title.className = 'results-title';
    resultsContainer.appendChild(title);

    // 显示识别结果
    results.forEach((result) => {
      const resultCard = this.createResultCard(result);
      resultsContainer.appendChild(resultCard);
    });
  }

  private createResultCard(result: RecognitionResult): HTMLElement {
    const card = document.createElement('div');
    card.className = 'recognition-result-card';

    card.innerHTML = `
      <div class="result-header">
        <img src="${getFlagImageUrl(result.country.code)}" alt="${result.country.nameCN}" class="result-flag">
        <div class="result-info">
          <h4>${result.country.nameCN} (${result.country.nameEN})</h4>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${result.confidence * 100}%"></div>
          </div>
          <span class="confidence-text">${Math.round(result.confidence * 100)}% ${i18n.t('recognition.match')}</span>
        </div>
      </div>
      ${result.matches.length > 0 ? `
        <div class="match-reasons">
          ${result.matches.map(reason => `<span class="match-reason">${reason}</span>`).join('')}
        </div>
      ` : ''}
    `;

    // 点击查看国家详情
    card.addEventListener('click', () => {
      this.showCountryDetail(result.country);
    });

    return card;
  }

  private showCountryDetail(country: Country): void {
    // 触发显示国家详情事件
    const event = new CustomEvent('showCountryDetail', {
      detail: { country, source: 'recognition' }
    });
    document.dispatchEvent(event);
  }

  private showCameraControls(): void {
    const startBtn = document.getElementById('start-camera-btn');
    const stopBtn = document.getElementById('stop-camera-btn');
    const captureBtn = document.getElementById('capture-photo-btn');
    const cameraContainer = document.getElementById('camera-container');

    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'inline-block';
    if (captureBtn) captureBtn.style.display = 'inline-block';
    if (cameraContainer) cameraContainer.style.display = 'block';
  }

  private retryCapture(): void {
    // 隐藏预览和结果
    const previewContainer = document.getElementById('preview-container');
    const resultsContainer = document.getElementById('recognition-results');
    const noResults = document.getElementById('no-results');

    if (previewContainer) previewContainer.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (noResults) noResults.style.display = 'none';

    // 重置文件输入
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // 清除画布内容
    if (this.canvasElement) {
      const ctx = this.canvasElement.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      }
    }

    console.log('已重置识别界面');
  }

  private hideCameraControls(): void {
    const startBtn = document.getElementById('start-camera-btn');
    const stopBtn = document.getElementById('stop-camera-btn');
    const captureBtn = document.getElementById('capture-photo-btn');
    const cameraContainer = document.getElementById('camera-container');

    if (startBtn) startBtn.style.display = 'inline-block';
    if (stopBtn) stopBtn.style.display = 'none';
    if (captureBtn) captureBtn.style.display = 'none';
    if (cameraContainer) cameraContainer.style.display = 'none';
  }

  private showLoading(show: boolean): void {
    const loading = document.getElementById('recognition-loading');
    if (loading) {
      loading.style.display = show ? 'block' : 'none';
    }
  }

  private showError(message: string): void {
    const errorElement = document.getElementById('recognition-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';

      // 3秒后自动隐藏错误信息
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 3000);
    }
  }

  
  cleanup(): void {
    // 停止摄像头
    this.stopCamera();

    // 清理界面状态
    const previewContainer = document.getElementById('preview-container');
    const resultsContainer = document.getElementById('recognition-results');
    const noResults = document.getElementById('no-results');
    const cameraContainer = document.getElementById('camera-container');

    if (previewContainer) previewContainer.style.display = 'none';
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
      resultsContainer.innerHTML = ''; // 清空内容
    }
    if (noResults) noResults.style.display = 'none';
    if (cameraContainer) cameraContainer.style.display = 'none';

    // 重置文件输入
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    console.log('国旗识别模块已清理');
  }

  /**
   * 显示国旗识别详情页面
   */
  showRecognitionDetail(): void {
    const toolsSection = document.getElementById('tools-section');
    const recognitionDetail = document.getElementById('flag-recognition-detail');

    if (toolsSection && recognitionDetail) {
      toolsSection.style.display = 'none';
      recognitionDetail.style.display = 'block';

      // 确保按钮布局始终正确（修复第二次进入时布局变成水平的问题）
      const methodButtons = recognitionDetail.querySelectorAll('.method-btn') as NodeListOf<HTMLElement>;
      methodButtons.forEach(btn => {
        // 强制重置 flexbox 布局为垂直方向
        btn.style.display = 'flex';
        btn.style.flexDirection = 'column';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
      });
    }

    console.log('显示国旗识别详情页面');
  }

  /**
   * 返回工具列表
   */
  backToTools(): void {
    const toolsSection = document.getElementById('tools-section');
    const recognitionDetail = document.getElementById('flag-recognition-detail');

    if (toolsSection && recognitionDetail) {
      recognitionDetail.style.display = 'none';
      toolsSection.style.display = 'block';
    }

    // 清理摄像头和识别状态
    this.cleanup();

    console.log('返回工具列表');
  }
}

// 导出模块实例
export const flagRecognitionModule = new FlagRecognitionModule();
