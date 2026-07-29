import { useEffect, useRef, useState } from 'react'
import './Hero.css'

/**
 * Hero —— 打字机版
 * 主标题按字符逐个显现，光标始终跟在末尾闪烁
 * - 打字节奏：60ms / 字符
 * - 空格 / 标点稍慢一点，制造节奏感
 * - 打完最后一个字符后光标继续闪
 * - 支持 prefers-reduced-motion：直接显示完成态
 */

// 打字节奏辅助：某些标点/空格后停顿更久
const punctPause = { ',': 260, '.': 380, '?': 380, '!': 380, ' ': 40 }

// 一段打字任务：type = 'text' 普通打字，type = 'br' 换行，type = 'accent' 打字（斜体高亮）
const script = [
  { text: 'Hello, ', type: 'text' },
  { text: "I'm ", type: 'text' },
  { text: 'Shuangli', type: 'accent' },
  { text: '.', type: 'text' },
  { type: 'br' },
  { text: 'Finding myself in ', type: 'text' },
  { text: 'what I ', type: 'text' },
  { text: 'build', type: 'accent' },
  { text: '.', type: 'text' },
]

export default function Hero() {
  const bgRef = useRef(null)
  const titleRef = useRef(null)
  const [tokens, setTokens] = useState([])       // 已经打出来的 token 数组
  const [pending, setPending] = useState('')     // 当前正在被打字的 segment（用于逐字追加）
  const [done, setDone] = useState(false)

  // 打字机核心
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      // 直接显示完成态
      setTokens(script)
      setDone(true)
      return
    }

    let cancelled = false
    let outTokens = []
    let currentIdx = 0
    let currentSeg = script[0]
    let currentText = ''
    let charIdx = 0

    const schedule = (delay, fn) => {
      const id = setTimeout(() => { if (!cancelled) fn() }, delay)
      return id
    }

    let timer

    const step = () => {
      if (currentIdx >= script.length) {
        setDone(true)
        return
      }
      const seg = script[currentIdx]
      // 特殊 token：换行 / 直接推入
      if (seg.type === 'br') {
        outTokens = [...outTokens, seg]
        setTokens(outTokens)
        setPending('')
        currentIdx++
        currentText = ''
        charIdx = 0
        timer = schedule(60, step)
        return
      }
      // 正常文本：逐字追加
      if (charIdx < seg.text.length) {
        const ch = seg.text[charIdx]
        currentText += ch
        setPending(currentText)
        // 当前 segment 用 pending 描述，token 里先不加
        charIdx++
        // 字符延迟：普通 60ms，特殊标点更久
        const pause = punctPause[ch] ?? 60
        timer = schedule(pause, step)
      } else {
        // 当前 segment 打完，把它固化进 tokens
        outTokens = [...outTokens, seg]
        setTokens(outTokens)
        setPending('')
        currentIdx++
        currentText = ''
        charIdx = 0
        // 段落间稍作停顿
        const gap = seg.type === 'accent' ? 200 : 80
        timer = schedule(gap, step)
      }
    }

    // 稍延迟启动，等 Hero 淡入
    timer = schedule(400, step)

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [])

  // 鼠标视差
  useEffect(() => {
    const bg = bgRef.current
    if (!bg) return
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40
        const y = (e.clientY / window.innerHeight - 0.5) * 40
        bg.style.setProperty('--mx', `${x}px`)
        bg.style.setProperty('--my', `${y}px`)
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  // 当前正在打字的 segment（决定是否用 accent 样式）
  const currentSeg = tokens.length < script.length ? script[tokens.length] : null

  return (
    <section id="top" className="hero">
      <div className="hero__bg" ref={bgRef} aria-hidden="true">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__ring" />
      </div>
      <div className="hero__inner container">
        <p className="hero__eyebrow">
          <span className="hero__eyebrow-line" />
          Portfolio / 2026
        </p>
        <h1 ref={titleRef} className="hero__title">
          {tokens.map((t, i) => {
            if (t.type === 'br') return <br key={`br-${i}`} />
            if (t.type === 'accent') {
              return (
                <span key={i} className="hero__accent">
                  <em>{t.text}</em>
                </span>
              )
            }
            return <span key={i}>{t.text}</span>
          })}
          {/* 正在打字的这一段 */}
          {pending && (
            currentSeg?.type === 'accent'
              ? <span className="hero__accent"><em>{pending}</em></span>
              : <span>{pending}</span>
          )}
          <span
            className={`hero__cursor ${done ? 'hero__cursor--done' : 'hero__cursor--typing'}`}
            aria-hidden="true"
          />
        </h1>
        <p className={`hero__tagline ${done ? 'hero__tagline--visible' : ''}`}>
          Commercial Ops · Client Growth · <span>the resume exists — this is everything else.</span>
        </p>

        <div className={`hero__scroll ${done ? 'hero__scroll--visible' : ''}`}>
          <span>scroll</span>
          <div className="hero__scroll-line" />
        </div>
      </div>
    </section>
  )
}