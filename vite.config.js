import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 项目页部署到 https://zhangshuangli123.github.io/ai-web/
// 项目页仓库需要以仓库名作为子路径 base
export default defineConfig({
  plugins: [react()],
  base: '/ai-web/',
})
