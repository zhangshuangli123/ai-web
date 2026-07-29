import { Component } from 'react'

/**
 * SafeBoundary —— 简单的错误边界
 * 子组件炸了就渲染 fallback（或什么都不渲染），不影响页面其他部分
 */
export default class SafeBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.warn('[SafeBoundary] caught:', error)
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}