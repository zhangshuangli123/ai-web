import { useEffect, useRef } from 'react'
import { useFadeIn } from '../hooks/useFadeIn.js'
import './About.css'

export default function About() {
  const ref = useFadeIn()
  const ledeRef = useRef(null)

  useEffect(() => {
    // 逐行淡入：观察 lede 内的 .about__line 元素
    const lede = ledeRef.current
    if (!lede) return
    const lines = lede.querySelectorAll('.about__line')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            lines.forEach((l, i) => {
              setTimeout(() => l.classList.add('visible'), i * 180)
            })
            io.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )
    io.observe(lede)
    return () => io.disconnect()
  }, [])

  return (
    <section id="about" className="about section" ref={ref}>
      <div className="container about__grid">
        <aside className="about__side" data-fade>
          <p className="section-label">01 / About</p>
          <div className="about__tags">
            <span className="about-tag-flow">Client Growth</span>
            <span className="about-tag-flow">Search Ops</span>
            <span className="about-tag-flow">AI Workflow</span>
          </div>
        </aside>
        <div className="about__body">
          <h2 className="about__lede" ref={ledeRef} data-fade>
            <span className="about__line">
              我是 <em>张双利</em>，上海外国语大学国际商务硕士，
            </span>
            <span className="about__line">
              现在在小红书商业化做 <strong>平台专家</strong>。
            </span>
            <span className="about__line">
              对 <em>「怎么把复杂的事讲清楚」</em> 有一点点执念，
            </span>
            <span className="about__line">
              相信 <strong>数据</strong>、<strong>直觉</strong> 和一点点手感，能一起把事情做好。
            </span>
          </h2>
          <div className="about__meta" data-fade>
            <div>
              <span className="about__meta-label">Currently</span>
              <p>小红书 · 商业部 · 平台专家（实习）</p>
            </div>
            <div>
              <span className="about__meta-label">Based in</span>
              <p>Shanghai · 上海</p>
            </div>
            <div>
              <span className="about__meta-label">Focus</span>
              <p>Client Growth · 搜索优化 · AI 工作流</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
