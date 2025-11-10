/**
 * 3D地球仪模块
 *
 * 使用Three.js实现交互式3D地球仪功能
 * - 地球场景渲染和星空背景
 * - 国家边界绘制和着色
 * - 鼠标交互(拖拽旋转、滚轮缩放、悬停高亮、点击查看)
 * - Canvas纹理绘制和ID检测
 * - 惯性旋转和自动旋转
 */

import * as THREE from 'three';
import type { Country } from '../types';

/**
 * GeoJSON Feature 接口
 */
interface GeoJSONFeature {
  type: string;
  id?: string;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    name?: string;
    NAME?: string;
    NAME_EN?: string;
    cname?: string;
    NAME_CN?: string;
    name_cn?: string;
    name_en?: string;
    ISO_A2?: string;
    iso_a2?: string;
    code?: string;
    region?: string;
    continent?: string;
  };
}

/**
 * GeoJSON 数据接口
 */
interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

/**
 * 国家属性接口
 */
interface CountryProps {
  name?: string;
  code: string;
  name_cn?: string;
  name_en?: string;
  continent?: string;
}

/**
 * 国家颜色数据接口
 */
interface CountryColorData {
  hex: string;
  idColor: string;
  country: CountryProps;
}

/**
 * 世界地图配色方案 - 参考真实世界地图的鲜艳配色
 */
const WORLD_MAP_COLOR_PALETTE = [
  // 鲜艳的红色系
  0xff6b6b, 0xff5252, 0xe74c3c, 0xf44336, 0xd32f2f,
  // 橙色系
  0xffa726, 0xff9800, 0xfb8c00, 0xf57c00, 0xff7043,
  // 黄色系
  0xffeb3b, 0xffd54f, 0xffc107, 0xffb300, 0xfdd835,
  // 绿色系
  0x66bb6a, 0x4caf50, 0x43a047, 0x2e7d32, 0x1b5e20, 0x81c784, 0x66bb6a, 0x4caf50, 0x388e3c,
  0x2e7d32,
  // 青色系
  0x26c6da, 0x00bcd4, 0x00acc1, 0x0097a7, 0x00838f,
  // 蓝色系
  0x42a5f5, 0x2196f3, 0x1e88e5, 0x1976d2, 0x1565c0, 0x5c6bc0, 0x3f51b5, 0x3949ab, 0x303f9f,
  0x283593,
  // 紫色系
  0xab47bc, 0x9c27b0, 0x8e24aa, 0x7b1fa2, 0x6a1b9a, 0xba68c8, 0xab47bc, 0x9c27b0, 0x8e24aa,
  0x7b1fa2,
  // 粉色系
  0xec407a, 0xe91e63, 0xd81b60, 0xc2185b, 0xad1457,
  // 深粉色
  0xf06292, 0xec407a, 0xe91e63, 0xd81b60, 0xc2185b,
  // 玫瑰红
  0xef5350, 0xe57373, 0xef5350, 0xf44336, 0xe53935,
  // 靛青色
  0x5c6bc0, 0x7986cb, 0x9fa8da, 0xc5cae9, 0x3f51b5,
  // 深绿色
  0x66bb6a, 0x81c784, 0xa5d6a7, 0xc8e6c9, 0x4caf50,
  // 棕色系
  0xa1887f, 0x8d6e63, 0x795548, 0x6d4c41, 0x5d4037,
  // 深橙色
  0xff7043, 0xff5722, 0xf4511e, 0xe64a19, 0xd84315,
  // 浅蓝色
  0x81d4fa, 0x4fc3f7, 0x29b6f6, 0x03a9f4, 0x039be5,
  // 浅绿色
  0xaed581, 0x9ccc65, 0x8bc34a, 0x7cb342, 0x689f38,
  // 黄绿色
  0xdce775, 0xd4e157, 0xcddc39, 0xc0ca33, 0xafb42b,
  // 青柠色
  0xaed581, 0x9ccc65, 0x8bc34a, 0x7cb342, 0x689f38,
];

/**
 * 3D地球仪模块类
 */
export class GlobeModule {
  // Three.js核心对象
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;

  // 地球相关对象
  private earth: THREE.Mesh | null = null;
  private starField: THREE.Points | null = null;

  // 交互相关
  private mousePosition = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();

  // 状态标志
  private initialized = false;
  private autoRotateEnabled = true;
  private isDragging = false;

  // 惯性旋转函数
  private applyInertia: (() => void) | null = null;

  // Canvas纹理相关
  private worldCanvas: HTMLCanvasElement | null = null;
  private worldCanvasCtx: CanvasRenderingContext2D | null = null;
  private worldTexture: THREE.CanvasTexture | null = null;

  // ID Canvas用于精确检测国家
  private idCanvas: HTMLCanvasElement | null = null;
  private idCanvasCtx: CanvasRenderingContext2D | null = null;

  // 国家数据映射
  private countryColorMap: Record<string, CountryColorData> = {};
  private countryIdMap: Record<string, string> = {};
  private idCounter = 1;

  // 星空闪烁数据
  private starOpacities: Float32Array | null = null;
  private starTwinkleSpeed: Float32Array | null = null;

  // GeoJSON数据
  private worldData: GeoJSONData | null = null;

  // 国家数据引用(从外部传入)
  private allCountries: Country[] = [];

  /**
   * 初始化3D地球仪
   * @param countries 所有国家数据
   */
  async init(countries: Country[]): Promise<void> {
    if (this.initialized) return;

    console.log('🌍 开始初始化3D地球仪...');

    this.allCountries = countries;

    try {
      const container = document.getElementById('globe-canvas-container');
      if (!container) {
        console.error('❌ 找不到地球仪容器元素');
        return;
      }

      // 设置场景
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x000000); // 纯黑背景，突出星空

      // 设置相机
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      this.camera.position.z = 5;

      // 设置渲染器
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比例以提高性能
      container.appendChild(this.renderer.domElement);

      // 创建星空背景
      this.createStarfield();

      // 创建地球
      this.createEarth();

      // 加载世界地图数据
      await this.loadWorldData();

      // 添加控制器并保存惯性函数
      this.applyInertia = this.addControls();

      // 添加事件监听
      this.addEventListeners();

      // 开始渲染循环
      this.animate();

      // 隐藏加载状态
      const loading = document.getElementById('globe-loading');
      if (loading) loading.style.display = 'none';

      this.initialized = true;
      console.log('🌍 3D地球仪初始化完成');
    } catch (error) {
      console.error('❌ 3D地球仪初始化失败:', error);

      // 显示错误信息
      const loading = document.getElementById('globe-loading');
      if (loading) {
        loading.innerHTML = `
          <div class="error-message">
            <h3>❌ 3D地球仪加载失败</h3>
            <p>您的浏览器可能不支持WebGL或Three.js库加载失败</p>
            <p>请尝试使用现代浏览器或刷新页面</p>
          </div>
        `;
      }
    }
  }

  /**
   * 创建星星纹理（圆形带光晕）
   */
  private createStarTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // 创建径向渐变（中心亮，边缘暗）
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // 中心：亮白色
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)'); // 内圈：半透明白色
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)'); // 中圈：光晕
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)'); // 外圈：微弱光晕
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // 边缘：完全透明

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * 创建星空背景
   */
  private createStarfield(): void {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 15000; // 增加星星数量

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    // 初始化闪烁数据
    this.starOpacities = new Float32Array(starCount);
    this.starTwinkleSpeed = new Float32Array(starCount);

    // 生成随机星星
    for (let i = 0; i < starCount; i++) {
      // 随机位置（球形分布）
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 50 + Math.random() * 50; // 距离范围：50-100

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // 星星颜色（更多样化）
      const starType = Math.random();
      if (starType < 0.7) {
        // 70% 白色星星
        const brightness = 0.8 + Math.random() * 0.2;
        colors[i * 3] = brightness;
        colors[i * 3 + 1] = brightness;
        colors[i * 3 + 2] = 1.0;
      } else if (starType < 0.85) {
        // 15% 蓝色星星
        colors[i * 3] = 0.6 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
        colors[i * 3 + 2] = 1.0;
      } else {
        // 15% 黄色/橙色星星
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
      }

      // 星星大小（更大范围的变化）
      const sizeRandom = Math.random();
      if (sizeRandom < 0.8) {
        // 80% 小星星
        sizes[i] = 0.5 + Math.random() * 1.5;
      } else if (sizeRandom < 0.95) {
        // 15% 中等星星
        sizes[i] = 2 + Math.random() * 2;
      } else {
        // 5% 大星星（明亮的恒星）
        sizes[i] = 4 + Math.random() * 3;
      }

      // 初始化闪烁参数
      this.starOpacities[i] = 0.5 + Math.random() * 0.5; // 初始透明度 0.5-1.0
      this.starTwinkleSpeed[i] = 0.0005 + Math.random() * 0.002; // 闪烁速度
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starsGeometry.setAttribute('alpha', new THREE.BufferAttribute(this.starOpacities, 1));

    // 创建星星纹理
    const starTexture = this.createStarTexture();

    // 使用ShaderMaterial实现独立的星星透明度
    const starsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: starTexture },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        attribute float alpha;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = color;
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec4 texColor = texture2D(pointTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor, 1.0) * texColor * vAlpha;
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.starField = new THREE.Points(starsGeometry, starsMaterial);
    this.scene!.add(this.starField);

    console.log('✨ 星空背景已创建（包含光晕和闪烁效果）');
  }

  /**
   * 创建地球（使用Canvas纹理）
   */
  private createEarth(): void {
    const geometry = new THREE.SphereGeometry(2, 64, 64);

    // 创建显示用的Canvas
    this.worldCanvas = document.createElement('canvas');
    this.worldCanvas.width = 2048; // 高分辨率纹理
    this.worldCanvas.height = 1024; // 2:1比例（等距圆柱投影）
    this.worldCanvasCtx = this.worldCanvas.getContext('2d', { willReadFrequently: true })!;

    // 初始化为海洋颜色
    this.worldCanvasCtx.fillStyle = '#4488BB';
    this.worldCanvasCtx.fillRect(0, 0, this.worldCanvas.width, this.worldCanvas.height);

    // 创建ID检测用的隐藏Canvas（关闭抗锯齿）
    this.idCanvas = document.createElement('canvas');
    this.idCanvas.width = 2048;
    this.idCanvas.height = 1024;
    this.idCanvasCtx = this.idCanvas.getContext('2d', {
      willReadFrequently: true,
      alpha: false,
    })!;
    // 关闭抗锯齿以获得精确的颜色
    this.idCanvasCtx.imageSmoothingEnabled = false;

    // 初始化为海洋颜色
    this.idCanvasCtx.fillStyle = '#4488BB';
    this.idCanvasCtx.fillRect(0, 0, this.idCanvas.width, this.idCanvas.height);

    // 创建纹理
    this.worldTexture = new THREE.CanvasTexture(this.worldCanvas);
    this.worldTexture.needsUpdate = true;

    // 使用纹理的材质
    const material = new THREE.MeshBasicMaterial({
      map: this.worldTexture,
      side: THREE.FrontSide,
      depthTest: true,
      depthWrite: true,
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.earth.renderOrder = 0;
    this.scene!.add(this.earth);

    console.log('🌍 地球球体已创建（使用Canvas纹理 + ID Canvas）');
  }

  /**
   * 加载世界地图数据
   */
  private async loadWorldData(): Promise<void> {
    try {
      // 优先尝试加载详细地图数据
      let response: Response;
      try {
        response = await fetch('/assets/geo/world_detailed.geojson');
        if (!response.ok) throw new Error('详细地图数据不存在');
      } catch {
        console.log('📍 使用简化地图数据...');
        response = await fetch('/assets/geo/world_simple.geojson');
      }

      this.worldData = await response.json();
      console.log('🗺️ 世界地图数据加载完成:', this.worldData?.features?.length || 0, '个国家/地区');

      // 创建国家填充
      this.createCountryMeshes();
    } catch (error) {
      console.error('❌ 加载世界地图数据失败:', error);
    }
  }

  /**
   * 生成独特的国家颜色
   */
  private getCountryColor(countryCode: string, index: number): number {
    // 使用国家代码生成一个稳定的哈希值
    let hash = 0;
    const code = countryCode || `country_${index}`;
    for (let i = 0; i < code.length; i++) {
      hash = ((hash << 5) - hash + code.charCodeAt(i)) & 0xffffffff;
    }

    // 确保哈希值为正数
    hash = Math.abs(hash);

    // 直接从调色板中选择颜色，不做额外变化
    const colorIndex = hash % WORLD_MAP_COLOR_PALETTE.length;
    return WORLD_MAP_COLOR_PALETTE[colorIndex];
  }

  /**
   * 创建国家填充（在Canvas上绘制）
   */
  private createCountryMeshes(): void {
    if (!this.worldData || !this.worldData.features) {
      console.error('❌ worldData 未加载或无效');
      return;
    }

    console.log('🎨 开始在Canvas上绘制国家...');

    // 清除显示Canvas
    this.worldCanvasCtx!.fillStyle = '#4488BB';
    this.worldCanvasCtx!.fillRect(0, 0, this.worldCanvas!.width, this.worldCanvas!.height);

    // 清除ID Canvas
    this.idCanvasCtx!.fillStyle = '#4488BB';
    this.idCanvasCtx!.fillRect(0, 0, this.idCanvas!.width, this.idCanvas!.height);

    // 重置映射
    this.countryColorMap = {};
    this.countryIdMap = {};
    this.idCounter = 1;

    const canvasWidth = this.worldCanvas!.width;
    const canvasHeight = this.worldCanvas!.height;

    // 坐标转换函数
    const coordsToCanvas = (lon: number, lat: number): [number, number] => {
      const x = ((lon + 180) / 360) * canvasWidth;
      const y = ((90 - lat) / 180) * canvasHeight;
      return [x, y];
    };

    this.worldData.features.forEach((feature, featureIndex) => {
      if (!feature.geometry || !feature.geometry.coordinates) return;

      // 标准化国家属性
      let rawCode = (
        feature.id ||
        feature.properties.ISO_A2 ||
        feature.properties.iso_a2 ||
        feature.properties.code ||
        ''
      ).toLowerCase();

      // 处理台湾的特殊ISO代码 "CN-TW" -> "tw"
      if (rawCode === 'cn-tw') {
        rawCode = 'tw';
      }

      const countryProps: CountryProps = {
        name: feature.properties.name || feature.properties.NAME || feature.properties.NAME_EN,
        code: rawCode,
        name_cn:
          feature.properties.cname || feature.properties.NAME_CN || feature.properties.name_cn,
        name_en:
          feature.properties.name ||
          feature.properties.NAME_EN ||
          feature.properties.name_en ||
          feature.properties.NAME,
        continent: feature.properties.region || feature.properties.continent,
      };

      if (!countryProps.code) return;

      // 台湾使用与中国相同的颜色键
      const colorKey = countryProps.code === 'tw' ? 'cn' : countryProps.code;

      // 为每个国家生成显示颜色和ID颜色
      let displayColor: string, idColor: string;

      if (this.countryColorMap[colorKey]) {
        displayColor = this.countryColorMap[colorKey].hex;
        // 为台湾生成独立的ID颜色（用于点击检测）
        if (countryProps.code === 'tw' && !this.countryColorMap[countryProps.code]) {
          const id = this.idCounter++;
          const r = id & 0xff;
          const g = (id >> 8) & 0xff;
          const b = (id >> 16) & 0xff;
          idColor = `rgb(${r},${g},${b})`;

          // 为台湾单独存储ID映射
          this.countryColorMap[countryProps.code] = {
            hex: displayColor,
            idColor: idColor,
            country: countryProps,
          };
          this.countryIdMap[idColor] = countryProps.code;
        } else {
          idColor = this.countryColorMap[colorKey].idColor;
        }
      } else {
        // 显示颜色（鲜艳的地图颜色）
        const colorHex = this.getCountryColor(colorKey, featureIndex);
        displayColor = '#' + colorHex.toString(16).padStart(6, '0');

        // ID颜色（唯一的RGB值用于检测）
        const id = this.idCounter++;
        const r = id & 0xff;
        const g = (id >> 8) & 0xff;
        const b = (id >> 16) & 0xff;
        idColor = `rgb(${r},${g},${b})`;

        // 存储映射
        this.countryColorMap[colorKey] = {
          hex: displayColor,
          idColor: idColor,
          country: countryProps,
        };
        this.countryIdMap[idColor] = colorKey;

        // 如果是台湾，也为台湾代码存储一份
        if (countryProps.code === 'tw') {
          this.countryColorMap[countryProps.code] = {
            hex: displayColor,
            idColor: idColor,
            country: countryProps,
          };
        }
      }

      // 绘制多边形到显示Canvas
      const drawPolygonDisplay = (coordinates: number[][][]) => {
        this.worldCanvasCtx!.fillStyle = displayColor;
        this.worldCanvasCtx!.strokeStyle = '#333333';
        this.worldCanvasCtx!.lineWidth = 0.5;

        coordinates.forEach((ring, ringIndex) => {
          this.worldCanvasCtx!.beginPath();
          ring.forEach((coord, i) => {
            const [x, y] = coordsToCanvas(coord[0], coord[1]);
            if (i === 0) this.worldCanvasCtx!.moveTo(x, y);
            else this.worldCanvasCtx!.lineTo(x, y);
          });
          this.worldCanvasCtx!.closePath();
          if (ringIndex === 0) this.worldCanvasCtx!.fill();
          this.worldCanvasCtx!.stroke();
        });
      };

      // 绘制多边形到ID Canvas（无抗锯齿，无边框）
      const drawPolygonId = (coordinates: number[][][]) => {
        this.idCanvasCtx!.fillStyle = idColor;

        coordinates.forEach((ring, ringIndex) => {
          this.idCanvasCtx!.beginPath();
          ring.forEach((coord, i) => {
            const [x, y] = coordsToCanvas(coord[0], coord[1]);
            if (i === 0) this.idCanvasCtx!.moveTo(x, y);
            else this.idCanvasCtx!.lineTo(x, y);
          });
          this.idCanvasCtx!.closePath();
          if (ringIndex === 0) this.idCanvasCtx!.fill();
        });
      };

      // 处理不同的几何类型
      if (feature.geometry.type === 'Polygon') {
        drawPolygonDisplay(feature.geometry.coordinates as number[][][]);
        drawPolygonId(feature.geometry.coordinates as number[][][]);
      } else if (feature.geometry.type === 'MultiPolygon') {
        (feature.geometry.coordinates as number[][][][]).forEach((polygon) => {
          drawPolygonDisplay(polygon);
          drawPolygonId(polygon);
        });
      }
    });

    // 更新显示纹理
    this.worldTexture!.needsUpdate = true;

    console.log('🌍 Canvas绘制完成，国家数量:', Object.keys(this.countryColorMap).length);
  }

  /**
   * 添加地球仪控制器（带惯性效果）
   */
  private addControls(): () => void {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };
    const damping = 0.92; // 惯性阻尼系数（0-1，越小衰减越快）
    const sensitivity = 0.006; // 旋转灵敏度

    const canvas = this.renderer!.domElement;

    canvas.addEventListener('mousedown', (event) => {
      isDragging = true;
      this.isDragging = true; // 标记正在拖拽
      this.autoRotateEnabled = false; // 停止自动旋转
      rotationVelocity = { x: 0, y: 0 }; // 停止惯性
      previousMousePosition = { x: event.clientX, y: event.clientY };
      canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (event) => {
      if (isDragging) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y,
        };

        // 计算旋转速度
        rotationVelocity.x = deltaMove.y * sensitivity;
        rotationVelocity.y = deltaMove.x * sensitivity;

        // 应用旋转（纹理会自动跟随地球旋转）
        this.earth!.rotation.y += rotationVelocity.y;
        this.earth!.rotation.x += rotationVelocity.x;

        // 限制X轴旋转范围，防止翻转过度
        this.earth!.rotation.x = Math.max(
          -Math.PI / 2.5,
          Math.min(Math.PI / 2.5, this.earth!.rotation.x)
        );

        previousMousePosition = { x: event.clientX, y: event.clientY };
      }

      // 更新鼠标位置用于射线检测
      const rect = canvas.getBoundingClientRect();
      this.mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });

    canvas.addEventListener('mouseup', () => {
      isDragging = false;
      this.isDragging = false;
      canvas.style.cursor = 'grab';

      // 5秒后重新启用自动旋转
      setTimeout(() => {
        if (!this.isDragging) {
          this.autoRotateEnabled = true;
        }
      }, 5000);
    });

    canvas.addEventListener('mouseleave', () => {
      isDragging = false;
      this.isDragging = false;
      canvas.style.cursor = 'default';

      // 5秒后重新启用自动旋转
      setTimeout(() => {
        if (!this.isDragging) {
          this.autoRotateEnabled = true;
        }
      }, 5000);
    });

    // 平滑滚轮缩放
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const zoomSpeed = 0.05; // 降低缩放速度
      const zoom = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;

      this.camera!.position.z *= zoom;
      this.camera!.position.z = Math.max(3, Math.min(10, this.camera!.position.z));
    });

    // 惯性旋转函数（在渲染循环中调用）
    return () => {
      if (
        !isDragging &&
        (Math.abs(rotationVelocity.x) > 0.0001 || Math.abs(rotationVelocity.y) > 0.0001)
      ) {
        this.earth!.rotation.y += rotationVelocity.y;
        this.earth!.rotation.x += rotationVelocity.x;

        // 限制X轴旋转
        this.earth!.rotation.x = Math.max(
          -Math.PI / 2.5,
          Math.min(Math.PI / 2.5, this.earth!.rotation.x)
        );

        // 应用阻尼
        rotationVelocity.x *= damping;
        rotationVelocity.y *= damping;
      }
    };
  }

  /**
   * 从UV坐标获取国家信息（使用ID Canvas进行精确检测）
   */
  private getCountryFromUV(uv: THREE.Vector2): CountryProps | null {
    if (!uv || !this.idCanvas) return null;

    // UV坐标转换为Canvas像素坐标
    const x = Math.floor(uv.x * this.idCanvas.width);
    const y = Math.floor((1 - uv.y) * this.idCanvas.height); // 翻转Y轴

    // 确保坐标在范围内
    if (x < 0 || x >= this.idCanvas.width || y < 0 || y >= this.idCanvas.height) {
      return null;
    }

    // 从ID Canvas读取像素颜色
    const imageData = this.idCanvasCtx!.getImageData(x, y, 1, 1);
    const r = imageData.data[0];
    const g = imageData.data[1];
    const b = imageData.data[2];

    // 转换为rgb字符串
    const idColor = `rgb(${r},${g},${b})`;

    // 在ID映射中查找对应的国家代码
    const countryCode = this.countryIdMap[idColor];
    if (countryCode && this.countryColorMap[countryCode]) {
      return this.countryColorMap[countryCode].country;
    }

    return null;
  }

  /**
   * 添加地球仪事件监听（基于UV坐标检测）
   */
  private addEventListeners(): void {
    const canvas = this.renderer!.domElement;
    let lastHoveredCountryCode: string | null = null;

    // 鼠标移动事件 - 悬停效果
    canvas.addEventListener('mousemove', () => {
      // 射线检测地球表面
      this.raycaster.setFromCamera(this.mousePosition, this.camera!);
      const intersects = this.raycaster.intersectObject(this.earth!);

      let hoveredCountryCode: string | null = null;

      if (intersects.length > 0) {
        const uv = intersects[0].uv;
        if (!uv) return;
        const countryData = this.getCountryFromUV(uv);

        if (countryData && countryData.code) {
          hoveredCountryCode = countryData.code;

          // 将台湾统一为中国（用于高亮比较）
          const normalizedCode = hoveredCountryCode === 'tw' ? 'cn' : hoveredCountryCode;
          const lastNormalizedCode =
            lastHoveredCountryCode === 'tw' ? 'cn' : lastHoveredCountryCode;

          // 如果是新的国家，重绘Canvas高亮（传入原始代码，让redrawCanvasWithHighlight处理）
          if (normalizedCode !== lastNormalizedCode) {
            this.redrawCanvasWithHighlight(hoveredCountryCode);
            lastHoveredCountryCode = hoveredCountryCode;
            canvas.style.cursor = 'pointer';
          }
        } else {
          // 鼠标在海洋上
          if (lastHoveredCountryCode !== null) {
            this.redrawCanvasWithHighlight(null);
            lastHoveredCountryCode = null;
            canvas.style.cursor = 'grab';
          }
        }
      } else {
        // 鼠标离开地球
        if (lastHoveredCountryCode !== null) {
          this.redrawCanvasWithHighlight(null);
          lastHoveredCountryCode = null;
          canvas.style.cursor = 'grab';
        }
      }
    });

    // 鼠标点击事件
    canvas.addEventListener('click', () => {
      // 射线检测地球表面
      this.raycaster.setFromCamera(this.mousePosition, this.camera!);
      const intersects = this.raycaster.intersectObject(this.earth!);

      if (intersects.length > 0) {
        const uv = intersects[0].uv;
        if (!uv) return;
        const countryData = this.getCountryFromUV(uv);

        if (countryData) {
          this.showCountryFlag(countryData);
        }
      }
    });

    // 鼠标离开画布时清除悬停效果
    canvas.addEventListener('mouseleave', () => {
      if (lastHoveredCountryCode !== null) {
        this.redrawCanvasWithHighlight(null);
        lastHoveredCountryCode = null;
      }
      canvas.style.cursor = 'default';
    });
  }

  /**
   * 重绘Canvas并高亮指定国家
   */
  private redrawCanvasWithHighlight(highlightCountryCode: string | null): void {
    if (!this.worldData || !this.worldCanvas) return;

    // 清除Canvas
    this.worldCanvasCtx!.fillStyle = '#4488BB';
    this.worldCanvasCtx!.fillRect(0, 0, this.worldCanvas.width, this.worldCanvas.height);

    const canvasWidth = this.worldCanvas.width;
    const canvasHeight = this.worldCanvas.height;

    // 坐标转换函数
    const coordsToCanvas = (lon: number, lat: number): [number, number] => {
      const x = ((lon + 180) / 360) * canvasWidth;
      const y = ((90 - lat) / 180) * canvasHeight;
      return [x, y];
    };

    // 如果高亮的是中国或台湾，两者都应该被高亮
    const highlightCodes: string[] = [];
    if (highlightCountryCode === 'cn' || highlightCountryCode === 'tw') {
      highlightCodes.push('cn', 'tw');
    } else if (highlightCountryCode) {
      highlightCodes.push(highlightCountryCode);
    }

    // 绘制所有国家
    this.worldData.features.forEach((feature) => {
      if (!feature.geometry || !feature.geometry.coordinates) return;

      let countryCode = (
        feature.id ||
        feature.properties.ISO_A2 ||
        feature.properties.iso_a2 ||
        feature.properties.code ||
        ''
      ).toLowerCase();

      // 处理台湾的特殊ISO代码 "CN-TW" -> "tw"
      if (countryCode === 'cn-tw') {
        countryCode = 'tw';
      }

      const colorData = this.countryColorMap[countryCode];
      if (!colorData) return;

      const isHighlighted = highlightCodes.includes(countryCode);
      const fillColor = colorData.hex;

      // 绘制多边形
      const drawPolygon = (coordinates: number[][][]) => {
        this.worldCanvasCtx!.fillStyle = fillColor;

        // 如果是高亮国家，使用黄色边框
        if (isHighlighted) {
          this.worldCanvasCtx!.strokeStyle = '#FFFF00';
          this.worldCanvasCtx!.lineWidth = 2;
        } else {
          this.worldCanvasCtx!.strokeStyle = '#333333';
          this.worldCanvasCtx!.lineWidth = 0.5;
        }

        coordinates.forEach((ring, ringIndex) => {
          this.worldCanvasCtx!.beginPath();
          ring.forEach((coord, i) => {
            const [x, y] = coordsToCanvas(coord[0], coord[1]);
            if (i === 0) {
              this.worldCanvasCtx!.moveTo(x, y);
            } else {
              this.worldCanvasCtx!.lineTo(x, y);
            }
          });
          this.worldCanvasCtx!.closePath();

          if (ringIndex === 0) {
            this.worldCanvasCtx!.fill();
          }
          this.worldCanvasCtx!.stroke();
        });
      };

      if (feature.geometry.type === 'Polygon') {
        drawPolygon(feature.geometry.coordinates as number[][][]);
      } else if (feature.geometry.type === 'MultiPolygon') {
        (feature.geometry.coordinates as number[][][][]).forEach((polygon) => {
          drawPolygon(polygon);
        });
      }
    });

    // 更新纹理
    this.worldTexture!.needsUpdate = true;
  }

  /**
   * 显示国家国旗弹窗
   */
  private showCountryFlag(countryData: CountryProps): void {
    console.log('🏁 点击国家:', countryData);

    // 将台湾映射到中国
    let searchCode = countryData.code;
    if (searchCode === 'tw' || searchCode === 'taiwan') {
      searchCode = 'cn';
      console.log('🇨🇳 台湾地区 -> 映射到中国');
    }

    // 改进的国家匹配逻辑
    let country = this.allCountries.find((c) => c.code === searchCode);

    // 如果通过代码找不到，尝试通过名称匹配
    if (!country) {
      country = this.allCountries.find(
        (c) =>
          c.nameCN === countryData.name_cn ||
          c.nameEN === countryData.name_en ||
          c.nameEN === countryData.name ||
          c.nameCN === countryData.name
      );
    }

    // 如果还是找不到，创建默认数据
    if (!country) {
      console.warn('未找到国家数据:', countryData);
      country = {
        code: searchCode || 'unknown',
        nameCN: countryData.name_cn || countryData.name || '未知国家',
        nameEN: countryData.name_en || countryData.name || 'Unknown Country',
        continent: '未知大洲',
        styles: [],
      };
    }

    // 创建弹窗
    const template = document.getElementById('globe-flag-popup-template') as HTMLTemplateElement;
    if (!template) return;

    const popup = template.content.cloneNode(true) as DocumentFragment;

    // 填充数据
    const flagImg = popup.querySelector('.popup-flag-img') as HTMLImageElement;
    const countryNameCn = popup.querySelector('.popup-country-name-cn') as HTMLElement;
    const countryNameEn = popup.querySelector('.popup-country-name-en') as HTMLElement;
    const countryContinent = popup.querySelector('.popup-country-continent') as HTMLElement;

    flagImg.src = `../../assets/images/flags/${country.code}.png`;
    flagImg.alt = `${country.nameCN}国旗`;
    countryNameCn.textContent = country.nameCN;
    countryNameEn.textContent = country.nameEN;
    countryContinent.textContent = country.continent;

    // 添加到页面
    document.body.appendChild(popup);

    // 添加关闭事件
    const closeBtn = document.querySelector('.close-popup-btn') as HTMLElement;
    const overlay = document.querySelector('.popup-overlay') as HTMLElement;

    const closePopup = () => {
      const popupElement = document.querySelector('.globe-flag-popup');
      const overlayElement = document.querySelector('.popup-overlay');
      if (popupElement) popupElement.remove();
      if (overlayElement) overlayElement.remove();
    };

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (overlay) overlay.addEventListener('click', closePopup);

    // ESC键关闭
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopup();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /**
   * 地球仪渲染循环
   */
  private animate = (): void => {
    if (!this.renderer || !this.scene || !this.camera) return;

    requestAnimationFrame(this.animate);

    // 星空缓慢旋转
    if (this.starField) {
      this.starField.rotation.y += 0.0001;
      this.starField.rotation.x += 0.00005;

      // 星星闪烁效果
      if (this.starOpacities && this.starTwinkleSpeed) {
        const alphaAttribute = this.starField.geometry.attributes.alpha;
        for (let i = 0; i < this.starOpacities.length; i++) {
          // 正弦波闪烁
          this.starOpacities[i] += this.starTwinkleSpeed[i];
          const opacity = 0.3 + Math.abs(Math.sin(this.starOpacities[i])) * 0.7;
          (alphaAttribute.array as Float32Array)[i] = opacity;
        }
        alphaAttribute.needsUpdate = true;
      }
    }

    // 地球自动旋转（当未拖拽且启用自动旋转时）
    if (this.earth && this.autoRotateEnabled && !this.isDragging) {
      this.earth.rotation.y += 0.001; // 缓慢自转
    }

    // 应用惯性旋转效果
    if (this.applyInertia) {
      this.applyInertia();
    }

    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * 处理窗口大小变化
   */
  handleResize(): void {
    if (!this.renderer || !this.camera) return;

    const container = document.getElementById('globe-canvas-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 清理Three.js资源
    if (this.renderer) {
      this.renderer.dispose();
      const container = document.getElementById('globe-canvas-container');
      if (container && this.renderer.domElement.parentNode === container) {
        container.removeChild(this.renderer.domElement);
      }
    }

    if (this.scene) {
      this.scene.clear();
    }

    // 清理几何体和材质
    if (this.earth) {
      this.earth.geometry.dispose();
      (this.earth.material as THREE.Material).dispose();
    }

    if (this.starField) {
      this.starField.geometry.dispose();
      (this.starField.material as THREE.Material).dispose();
    }

    // 清理纹理
    if (this.worldTexture) {
      this.worldTexture.dispose();
    }

    console.log('🧹 3D地球仪资源已清理');
  }
}

// 导出单例实例
export const globeModule = new GlobeModule();
