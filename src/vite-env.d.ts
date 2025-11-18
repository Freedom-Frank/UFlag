/// <reference types="vite/client" />

// 声明 JSON 模块
declare module '*.json' {
  const value: any;
  export default value;
}

// 声明图片资源
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

// 声明 GeoJSON 文件
declare module '*.geojson' {
  const value: any;
  export default value;
}
