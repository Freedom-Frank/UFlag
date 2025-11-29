/**
 * 国旗特征批量生成脚本 - 2.0版本
 * 使用高精度HSV颜色空间和多维度特征
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// 配置
const FLAGS_DIR = path.join(__dirname, '../assets/images/flags');
const COUNTRIES_FILE = path.join(__dirname, '../data/countries/countries_un.json');
const OUTPUT_FILE = path.join(__dirname, '../data/flag-features.json');

class HighPrecisionFlagFeatureExtractor {
    constructor() {
        this.targetWidth = 150;
        this.targetHeight = 100;
        this.colorPrecision = 10; // 10单位精度
    }

    // RGB转HSV颜色空间
    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        let h = 0;
        let s = max === 0 ? 0 : diff / max;
        let v = max;

        if (diff !== 0) {
            switch (max) {
                case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / diff + 2) / 6; break;
                case b: h = ((r - g) / diff + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    }

    // HSV量化到指定精度
    quantizeHsv(h, s, v) {
        const hQuant = Math.floor(h / 15) * 15; // 色调15度精度
        const sQuant = Math.floor(s / 10) * 10; // 饱和度10%精度
        const vQuant = Math.floor(v / this.colorPrecision) * this.colorPrecision; // 明度10单位精度
        return `${hQuant},${sQuant},${vQuant}`;
    }

    async extractFeatures(imagePath) {
        try {
            // 加载图片
            const image = await loadImage(imagePath);

            // 创建canvas
            const canvas = createCanvas(this.targetWidth, this.targetHeight);
            const ctx = canvas.getContext('2d');

            // 设置背景色为白色
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, this.targetWidth, this.targetHeight);

            // 缩放图像
            ctx.drawImage(image, 0, 0, this.targetWidth, this.targetHeight);

            // 获取图像数据
            const imageData = ctx.getImageData(0, 0, this.targetWidth, this.targetHeight);

            // 分析特征
            return this.analyzeEnhancedFeatures(imageData);
        } catch (error) {
            console.warn(`提取图像特征失败: ${imagePath}`, error);
            return null;
        }
    }

    analyzeEnhancedFeatures(imageData) {
        const data = imageData.data;
        const hsvColorMap = new Map();
        const rgbColorMap = new Map();
        const pixels = [];

        // 分析颜色分布 - 使用HSV颜色空间
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // HSV量化
            const hsv = this.rgbToHsv(r, g, b);
            const hsvColor = this.quantizeHsv(hsv.h, hsv.s, hsv.v);
            hsvColorMap.set(hsvColor, (hsvColorMap.get(hsvColor) || 0) + 1);

            // RGB精确值存储（用于纯色匹配）
            const rgbColor = `${Math.floor(r/10)*10},${Math.floor(g/10)*10},${Math.floor(b/10)*10}`;
            rgbColorMap.set(rgbColor, (rgbColorMap.get(rgbColor) || 0) + 1);

            pixels.push({
                x: (i / 4) % this.targetWidth,
                y: Math.floor((i / 4) / this.targetWidth),
                r, g, b, hsv
            });
        }

        // 获取HSV主要颜色
        const sortedHsvColors = Array.from(hsvColorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8); // 增加到8个主要颜色

        const dominant = sortedHsvColors
            .map(([color]) => `hsv(${color})`);

        // 计算颜色分布百分比
        const totalPixels = imageData.width * imageData.height;
        const distribution = sortedHsvColors
            .map(([_, count]) => count / totalPixels);

        // RGB精确颜色（用于纯色匹配）
        const preciseColors = Array.from(rgbColorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([color, count]) => ({
                rgb: `rgb(${color})`,
                ratio: count / totalPixels
            }));

        // 增强布局检测
        const layout = this.detectEnhancedLayout(imageData);

        // 增强形状检测
        const shapes = this.detectEnhancedShapes(imageData, hsvColorMap, pixels);

        // 颜色比例分析
        const colorProportions = this.analyzeColorProportions(distribution);

        // 新特征维度
        const newFeatures = this.extractNewFeatures(pixels, imageData, distribution);

        return {
            dominant: dominant,
            distribution: distribution,
            layout: layout,
            shapes: shapes,
            colorProportions: colorProportions,
            newFeatures: newFeatures,
            preciseColors: preciseColors // 新增：精确RGB颜色
        };
    }

    // 增强布局检测 - 50条采样线 + HSV颜色空间
    detectEnhancedLayout(imageData) {
        const { data, width, height } = imageData;
        const sampleLines = 50; // 增加到50条采样线

        // 检查水平条纹
        const horizontalPatterns = [];
        for (let y = 0; y < height; y += Math.floor(height / sampleLines)) {
            let rowPattern = [];
            for (let x = 0; x < width; x += 3) { // 每3个像素采样一次
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const hsv = this.rgbToHsv(r, g, b);
                rowPattern.push(this.quantizeHsv(hsv.h, hsv.s, hsv.v));
            }
            horizontalPatterns.push(rowPattern.join(','));
        }

        const uniqueHorizontalRows = new Set(horizontalPatterns).size;
        if (uniqueHorizontalRows <= 4) { // 稍微放宽判断条件
            return 'horizontal';
        }

        // 检查垂直条纹
        const verticalPatterns = [];
        for (let x = 0; x < width; x += Math.floor(width / sampleLines)) {
            let colPattern = [];
            for (let y = 0; y < height; y += 3) {
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const hsv = this.rgbToHsv(r, g, b);
                colPattern.push(this.quantizeHsv(hsv.h, hsv.s, hsv.v));
            }
            verticalPatterns.push(colPattern.join(','));
        }

        const uniqueVerticalCols = new Set(verticalPatterns).size;
        if (uniqueVerticalCols <= 4) {
            return 'vertical';
        }

        // 检查对角线图案 - 增强采样
        const diagonalPatterns1 = [];
        const diagonalPatterns2 = [];

        const diagonalSamples = Math.min(width, height) / 8; // 增加对角线采样点
        for (let i = 0; i < diagonalSamples; i++) {
            const step = Math.min(width, height) / diagonalSamples;

            // 左上到右下对角线
            const index1 = Math.floor(i * step);
            const x1 = Math.min(index1, width - 1);
            const y1 = Math.min(index1, height - 1);
            const idx1 = (y1 * width + x1) * 4;
            const r1 = data[idx1];
            const g1 = data[idx1 + 1];
            const b1 = data[idx1 + 2];
            const hsv1 = this.rgbToHsv(r1, g1, b1);
            diagonalPatterns1.push(this.quantizeHsv(hsv1.h, hsv1.s, hsv1.v));

            // 右上到左下对角线
            const x2 = Math.min(index1, width - 1);
            const y2 = Math.min(height - 1 - index1, height - 1);
            const idx2 = (y2 * width + x2) * 4;
            const r2 = data[idx2];
            const g2 = data[idx2 + 1];
            const b2 = data[idx2 + 2];
            const hsv2 = this.rgbToHsv(r2, g2, b2);
            diagonalPatterns2.push(this.quantizeHsv(hsv2.h, hsv2.s, hsv2.v));
        }

        const uniqueDiagonal1 = new Set(diagonalPatterns1).size;
        const uniqueDiagonal2 = new Set(diagonalPatterns2).size;

        if (uniqueDiagonal1 <= 6 || uniqueDiagonal2 <= 6) {
            return 'diagonal';
        }

        // 检查纯色国旗
        const totalUniqueColors = new Set([...horizontalPatterns, ...verticalPatterns]).size;
        if (totalUniqueColors <= 3) {
            return 'solid';
        }

        return 'complex';
    }

    // 增强形状检测 - 支持任意位置圆形，精确检测
    detectEnhancedShapes(imageData, hsvColorMap, pixels) {
        const shapes = {
            hasCircle: false,
            hasStripes: false,
            hasStar: false,
            hasCross: false,
            circleInfo: null, // 新增：圆形详细信息
            stripeInfo: null, // 新增：条纹详细信息
            starInfo: null    // 新增：星形详细信息
        };

        // 检测条纹图案（基于布局检测结果）
        const layout = this.detectEnhancedLayout(imageData);
        shapes.hasStripes = layout === 'horizontal' || layout === 'vertical';
        shapes.stripeInfo = shapes.hasStripes ? { type: layout, count: this.countStripes(imageData) } : null;

        // 检测圆形图案 - 支持任意位置
        shapes.circleInfo = this.detectCircularPatternEnhanced(imageData, hsvColorMap, pixels);
        shapes.hasCircle = shapes.circleInfo !== null;

        // 检测星形图案 - 增强检测
        shapes.starInfo = this.detectStarPatternEnhanced(imageData, hsvColorMap);
        shapes.hasStar = shapes.starInfo !== null;

        // 检测十字图案 - 增强检测
        shapes.hasCross = this.detectCrossPatternEnhanced(imageData);

        return shapes;
    }

    // 增强圆形检测 - 支持任意位置和大小
    detectCircularPatternEnhanced(imageData, hsvColorMap, pixels) {
        const { data, width, height } = imageData;
        const minRadius = Math.min(width, height) * 0.05; // 最小半径
        const maxRadius = Math.min(width, height) * 0.3;  // 最大半径

        // 获取主要和次要颜色
        const sortedColors = Array.from(hsvColorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (sortedColors.length < 2) return null;

        const mainColor = sortedColors[0][0];
        const secondaryColor = sortedColors[1][0];

        // 简化的圆形检测 - 检查中心区域
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        const radius = Math.floor(Math.min(width, height) / 6);

        let targetColorPixels = 0;
        let totalCirclePixels = 0;

        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                if (distance <= radius) {
                    const i = (y * width + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const hsv = this.rgbToHsv(r, g, b);
                    const color = this.quantizeHsv(hsv.h, hsv.s, hsv.v);

                    totalCirclePixels++;
                    if (color === secondaryColor) {
                        targetColorPixels++;
                    }
                }
            }
        }

        const circleScore = totalCirclePixels > 0 ? targetColorPixels / totalCirclePixels : 0;

        if (circleScore > 0.6) {
            return {
                centerX: centerX,
                centerY: centerY,
                radius: radius,
                confidence: circleScore
            };
        }

        return null;
    }

    // 计算条纹数量
    countStripes(imageData) {
        const { data, width, height } = imageData;
        const stripeColors = new Set();

        // 水平条纹计数
        for (let y = 0; y < height; y += Math.floor(height / 10)) {
            let rowColor = '';
            for (let x = 0; x < width; x += 5) {
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const hsv = this.rgbToHsv(r, g, b);
                rowColor += this.quantizeHsv(hsv.h, hsv.s, hsv.v);
            }
            stripeColors.add(rowColor);
        }

        return stripeColors.size;
    }

    // 增强星形检测
    detectStarPatternEnhanced(imageData, hsvColorMap) {
        const { data, width, height } = imageData;

        // 检测角落区域的复杂颜色模式
        const corners = [
            { x: 0, y: 0, w: width * 0.2, h: height * 0.2 },
            { x: width * 0.8, y: 0, w: width * 0.2, h: height * 0.2 }
        ];

        let starScore = 0;
        for (const corner of corners) {
            const uniqueColors = new Set();
            let colorChangeCount = 0;
            let lastColor = null;

            // 详细扫描角落区域
            for (let y = corner.y; y < corner.y + corner.h; y += 2) {
                for (let x = corner.x; x < corner.x + corner.w; x += 2) {
                    const i = (y * width + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const hsv = this.rgbToHsv(r, g, b);
                    const color = this.quantizeHsv(hsv.h, hsv.s, hsv.v);

                    uniqueColors.add(color);
                    if (lastColor && lastColor !== color) {
                        colorChangeCount++;
                    }
                    lastColor = color;
                }
            }

            // 如果角落区域颜色复杂度高，可能是星形或其他复杂图案
            if (uniqueColors.size > 4 && colorChangeCount > uniqueColors.size * 2) {
                starScore++;
            }
        }

        return starScore >= 1 ? {
            detected: true,
            corners: starScore,
            confidence: Math.min(1.0, starScore / 2)
        } : null;
    }

    // 增强十字检测
    detectCrossPatternEnhanced(imageData) {
        const { data, width, height } = imageData;
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        const crossWidth = Math.max(3, Math.min(width, height) / 15);

        let crossPixels = 0;
        let totalCrossArea = 0;

        // 检测水平和垂直十字区域
        for (let x = centerX - crossWidth * 2; x <= centerX + crossWidth * 2; x++) {
            for (let y = centerY - crossWidth; y <= centerY + crossWidth; y++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const i = (y * width + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // 检测十字的典型颜色（白色、黑色或高对比度）
                    const isCrossColor = (r > 220 && g > 220 && b > 220) || // 白色
                                       (r < 35 && g < 35 && b < 35) ||      // 黑色
                                       (Math.abs(r - g) < 30 && Math.abs(r - b) < 30); // 灰色

                    if (isCrossColor) {
                        crossPixels++;
                    }
                    totalCrossArea++;
                }
            }
        }

        return totalCrossArea > 0 && crossPixels / totalCrossArea > 0.25;
    }

    // 分析颜色比例
    analyzeColorProportions(distribution) {
        return {
            mainColorRatio: distribution[0] || 0,
            hasThreePlusColors: distribution.length >= 3 && distribution[2] > 0.05,
            colorBalance: distribution.length > 1 ?
                Math.min(...distribution.slice(1)) / Math.max(...distribution.slice(1)) : 0,
            totalColors: distribution.length
        };
    }

    // 新特征维度提取 - 纹理、对称性、视觉重心
    extractNewFeatures(pixels, imageData, distribution) {
        const { width, height } = imageData;

        // 1. 纹理复杂度分析
        const textureComplexity = this.calculateTextureComplexity(imageData);

        // 2. 对称性检测
        const symmetryScore = this.calculateSymmetryScore(imageData);

        // 3. 视觉重心计算
        const visualCenter = this.calculateVisualCenter(pixels, width, height);

        // 4. 颜色梯度分析
        const gradientStrength = this.calculateGradientStrength(imageData);

        // 5. 边缘复杂度
        const edgeComplexity = this.calculateEdgeComplexity(imageData);

        return {
            textureComplexity: textureComplexity,
            symmetryScore: symmetryScore,
            visualCenter: visualCenter,
            gradientStrength: gradientStrength,
            edgeComplexity: edgeComplexity,
            isPureColor: distribution[0] > 0.95 // 纯色判断
        };
    }

    // 计算纹理复杂度
    calculateTextureComplexity(imageData) {
        const { data, width, height } = imageData;
        let totalColorDiff = 0;
        let comparisons = 0;

        // 计算相邻像素的颜色差异
        for (let y = 0; y < height - 1; y += 2) {
            for (let x = 0; x < width - 1; x += 2) {
                const i = (y * width + x) * 4;

                // 水平比较
                const iRight = (y * width + x + 1) * 4;
                const horizDiff = Math.abs(data[i] - data[iRight]) +
                               Math.abs(data[i + 1] - data[iRight + 1]) +
                               Math.abs(data[i + 2] - data[iRight + 2]);

                // 垂直比较
                const iBottom = ((y + 1) * width + x) * 4;
                const vertDiff = Math.abs(data[i] - data[iBottom]) +
                              Math.abs(data[i + 1] - data[iBottom + 1]) +
                              Math.abs(data[i + 2] - data[iBottom + 2]);

                totalColorDiff += Math.min(horizDiff, vertDiff);
                comparisons++;
            }
        }

        return comparisons > 0 ? totalColorDiff / (comparisons * 255 * 3) : 0;
    }

    // 计算对称性得分
    calculateSymmetryScore(imageData) {
        const { data, width, height } = imageData;
        let horizontalSymmetry = 0;
        let verticalSymmetry = 0;

        // 水平对称性（上下对称）
        for (let y = 0; y < height / 2; y++) {
            for (let x = 0; x < width; x++) {
                const iTop = (y * width + x) * 4;
                const iBottom = ((height - 1 - y) * width + x) * 4;

                const diff = Math.abs(data[iTop] - data[iBottom]) +
                           Math.abs(data[iTop + 1] - data[iBottom + 1]) +
                           Math.abs(data[iTop + 2] - data[iBottom + 2]);

                horizontalSymmetry += 1 - (diff / (255 * 3));
            }
        }

        // 垂直对称性（左右对称）
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width / 2; x++) {
                const iLeft = (y * width + x) * 4;
                const iRight = (y * width + (width - 1 - x)) * 4;

                const diff = Math.abs(data[iLeft] - data[iRight]) +
                           Math.abs(data[iLeft + 1] - data[iRight + 1]) +
                           Math.abs(data[iLeft + 2] - data[iRight + 2]);

                verticalSymmetry += 1 - (diff / (255 * 3));
            }
        }

        const hScore = horizontalSymmetry / ((height / 2) * width);
        const vScore = verticalSymmetry / (height * (width / 2));

        return {
            horizontal: hScore,
            vertical: vScore,
            overall: (hScore + vScore) / 2
        };
    }

    // 计算视觉重心
    calculateVisualCenter(pixels, width, height) {
        let totalWeight = 0;
        let weightedX = 0;
        let weightedY = 0;

        // 使用亮度作为权重
        for (const pixel of pixels) {
            const brightness = (pixel.r + pixel.g + pixel.b) / 3;
            const weight = 255 - brightness; // 暗色区域权重更高

            weightedX += pixel.x * weight;
            weightedY += pixel.y * weight;
            totalWeight += weight;
        }

        if (totalWeight > 0) {
            return {
                x: Math.round(weightedX / totalWeight),
                y: Math.round(weightedY / totalWeight),
                isCentered: false
            };
        }

        return { x: width / 2, y: height / 2, isCentered: true };
    }

    // 计算颜色梯度强度
    calculateGradientStrength(imageData) {
        const { data, width, height } = imageData;
        let totalGradient = 0;
        let gradientCount = 0;

        // Sobel边缘检测简化版
        for (let y = 1; y < height - 1; y += 2) {
            for (let x = 1; x < width - 1; x += 2) {
                const i = (y * width + x) * 4;

                // X方向梯度
                const iLeft = (y * width + (x - 1)) * 4;
                const iRight = (y * width + (x + 1)) * 4;
                const gradX = Math.abs(
                    (data[iLeft] + data[iLeft + 1] + data[iLeft + 2]) -
                    (data[iRight] + data[iRight + 1] + data[iRight + 2])
                );

                // Y方向梯度
                const iTop = ((y - 1) * width + x) * 4;
                const iBottom = ((y + 1) * width + x) * 4;
                const gradY = Math.abs(
                    (data[iTop] + data[iTop + 1] + data[iTop + 2]) -
                    (data[iBottom] + data[iBottom + 1] + data[iBottom + 2])
                );

                totalGradient += Math.sqrt(gradX * gradX + gradY * gradY);
                gradientCount++;
            }
        }

        return gradientCount > 0 ? totalGradient / gradientCount : 0;
    }

    // 计算边缘复杂度
    calculateEdgeComplexity(imageData) {
        const { data, width, height } = imageData;
        const threshold = 30; // 边缘检测阈值
        let edgePixels = 0;
        let totalChecked = 0;

        for (let y = 1; y < height - 1; y += 2) {
            for (let x = 1; x < width - 1; x += 2) {
                const i = (y * width + x) * 4;
                const centerBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

                // 检查8个邻居
                const neighbors = [
                    ((y - 1) * width + (x - 1)) * 4,
                    ((y - 1) * width + x) * 4,
                    ((y - 1) * width + (x + 1)) * 4,
                    (y * width + (x - 1)) * 4,
                    (y * width + (x + 1)) * 4,
                    ((y + 1) * width + (x - 1)) * 4,
                    ((y + 1) * width + x) * 4,
                    ((y + 1) * width + (x + 1)) * 4
                ];

                let significantDiff = 0;
                for (const ni of neighbors) {
                    const neighborBrightness = (data[ni] + data[ni + 1] + data[ni + 2]) / 3;
                    if (Math.abs(centerBrightness - neighborBrightness) > threshold) {
                        significantDiff++;
                    }
                }

                if (significantDiff > 2) {
                    edgePixels++;
                }
                totalChecked++;
            }
        }

        return totalChecked > 0 ? edgePixels / totalChecked : 0;
    }
}

// 主函数
async function generateFeatures() {
    console.log('🎯 2.0版高精度国旗特征生成器启动');
    console.log('核心升级: HSV颜色空间 + 10单位精度 + 多维度特征');

    try {
        // 读取国家数据
        console.log('📖 加载国家数据...');
        const countriesData = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf8'));
        const countries = countriesData.countries || countriesData;
        console.log(`✅ 已加载 ${countries.length} 个国家数据`);

        // 初始化特征提取器
        const extractor = new HighPrecisionFlagFeatureExtractor();
        const flagFeatures = {};

        let successCount = 0;
        let errorCount = 0;

        console.log('🔄 开始批量生成特征...');

        // 为每个国家生成特征
        for (let i = 0; i < countries.length; i++) {
            const country = countries[i];
            const imagePath = path.join(FLAGS_DIR, `${country.code.toLowerCase()}.png`);

            try {
                console.log(`⏳ 处理中: ${country.nameCN} (${country.code}) [${i + 1}/${countries.length}]`);

                // 检查图片文件是否存在
                if (!fs.existsSync(imagePath)) {
                    console.log(`❌ 图片不存在: ${imagePath}`);
                    errorCount++;
                    continue;
                }

                // 提取特征
                const features = await extractor.extractFeatures(imagePath);

                if (features) {
                    flagFeatures[country.code] = {
                        ...features,
                        country: {
                            code: country.code,
                            nameCN: country.nameCN,
                            nameEN: country.nameEN
                        }
                    };
                    successCount++;
                    console.log(`✅ ${country.nameCN} - 特征提取完成`);
                } else {
                    errorCount++;
                    console.log(`❌ ${country.nameCN} - 特征提取失败`);
                }

            } catch (error) {
                console.log(`❌ ${country.nameCN} - 处理失败:`, error.message);
                errorCount++;
            }

            // 进度显示
            if ((i + 1) % 10 === 0 || i === countries.length - 1) {
                const progress = Math.round(((i + 1) / countries.length) * 100);
                console.log(`📊 进度: ${progress}% (${i + 1}/${countries.length})`);
            }
        }

        // 生成输出数据
        const outputData = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalCountries: countries.length,
                processedCount: successCount,
                errorCount: errorCount,
                version: '2.0.0-HSV-HighPrecision',
                note: '2.0版高精度特征生成器 - HSV颜色空间 + 10单位精度 + 多维度特征',
                features: {
                    colorSpace: 'HSV',
                    colorPrecision: 10,
                    sampleLines: 50,
                    newDimensions: [
                        'textureComplexity',
                        'symmetryScore',
                        'visualCenter',
                        'gradientStrength',
                        'edgeComplexity',
                        'preciseColors'
                    ],
                    enhancedDetection: [
                        'arbitraryPositionCircles',
                        'enhancedStarDetection',
                        'improvedCrossDetection',
                        'solidColorSpecialization'
                    ]
                }
            },
            features: flagFeatures
        };

        // 保存结果
        console.log('💾 保存特征数据...');
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));

        const fileSize = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2);

        console.log('\n🎉 国旗特征生成完成！');
        console.log('📊 处理结果:');
        console.log(`   - 总国家数: ${countries.length}`);
        console.log(`   - 成功处理: ${successCount}`);
        console.log(`   - 处理失败: ${errorCount}`);
        console.log(`   - 文件大小: ${fileSize} KB`);
        console.log(`   - 输出文件: ${OUTPUT_FILE}`);

        return outputData;

    } catch (error) {
        console.error('❌ 生成过程中发生错误:', error);
        throw error;
    }
}

// 运行生成器
if (require.main === module) {
    generateFeatures().catch(error => {
        console.error('❌ 程序执行失败:', error);
        process.exit(1);
    });
}

module.exports = { generateFeatures, HighPrecisionFlagFeatureExtractor };