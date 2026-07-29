import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useFadeIn } from '../hooks/useFadeIn.js'
import './Experience.css'

// Vite base URL：本地 dev 是 "/"，CDN 部署是 "/formula-static/dibp/xxx/"
// 需要拼到所有静态资源前，否则 Vite base 不会自动加到 CSS inline url() 里
const B = import.meta.env.BASE_URL

// 时间顺序：早 → 晚（左 → 右）
const chapters = [
  {
    era: 'Bachelor', year: '2021 — 2025', tick: '2021',
    title: 'Wuhan Textile University', subtitle: 'Bachelor · Business English',
    photo: `${B}photos/photo-bachelor-v2.jpg`, photoObj: 'center 30%',
    desc: 'GPA 3.93（专业前 5%），国家励志奖学金、优秀毕业生奖学金、校二等奖学金、校三好学生；CET-6、TEM-4、高中英语教师资格证。四年里养成了对文字的敏感和对细节的耐心。',
    place: 'Wuhan', org: '武汉纺织大学',
  },
  {
    era: 'Chapter 02', year: '2025.04 — 2025.08', tick: '2025',
    title: 'GOTU', subtitle: 'Intern · User Growth',
    photo: `${B}photos/photo-gsx.jpg`, photoObj: 'center 40%',
    desc: '独立负责 400+ 用户线索到成单的全流程运营，按意向强度分为高/中/低三层，差异化设计触达节奏与资源投入；基于 CRM 搭建标签体系与分级看板，落地全周期跟进 SOP，月转化率 12%、个人 GMV 超 9 万元。参与直播实时互动运营，通过卖点场景化提炼与节奏把控带动单场停留与转化 +10%；搭建流失用户分层召回策略。',
    place: 'Beijing', org: '高途',
  },
  {
    era: 'Master', year: '2025.09 — 至今', tick: '2025',
    title: 'SISU', subtitle: 'Master · International Business',
    photo: `${B}photos/photo-sisu.jpg`, photoObj: 'center 55%',
    desc: '在跨学科的语境里训练「先分析问题，再决定用什么方法」的习惯；把商业、语言和一点点研究气质捏在一起，让思考更结构化。',
    place: 'Shanghai', org: '上海外国语大学',
  },
  {
    era: 'Chapter 03', year: '2025.10 — 2026.02', tick: '2025',
    title: 'POIZON · Dewu', subtitle: 'Intern · Category Ops',
    photo: `${B}photos/photo-dewu.jpg`, photoObj: 'center',
    desc: '大家电 & 医疗类目「人 + 货」两端并行治理：人侧针对 200+ 卖家搭建上新节奏机制，推动上新率提升 20pt、信息质量分 95+ 占比拉升至 90%，同步引入 6 个季增品牌、出价 SKU 季增近 1500 个；货侧按价格带 × 品牌覆盖缺口反向对接卖家上架超千级 SKU，搭建竞品比价 + 库存双监控推动低价率提升近 20pt、高价率下降超 15pt。独立统筹「疯狂周末」周度营销节点全链路，覆盖节前选品动员 + 节后爆发复盘两阶段闭环，单期活动 GMV 峰值涨幅超 35%。',
    place: 'Shanghai', org: '得物',
  },
  {
    era: 'Now', year: '2026.03 —', tick: '2026',
    title: 'RED · Xiaohongshu', subtitle: 'Platform Specialist',
    photo: `${B}photos/photo-red-team.jpg`, photoObj: 'center 55%',
    desc: '负责拼多多、1688、唯品会、京东等头部电商客户的广告投放服务，围绕考核成本制定 KFS 组合策略，日盯盘 + 周复盘跟踪消耗/CTR/转化成本，按月交付洞察报告支撑客户预算与结构决策。承接 618 大促全周期陪跑（投前推动 UG 激活迁移打通用增线链路、投中实时盯盘调优、投后多维复盘 + AIPS 人群洞察），大促日消耗环比稳态期 +40%、参竞率稳定 70%+。深度参与「扩买词 + 提相关性 + 增基建」搜索优化专项，独立从 0 到 1 搭建搜索场域 AI 工具沉淀为组内工具箱，反哺唯品会/闲鱼等重点客户词包交付并陪跑 AIGC 智能笔记改写，最终搜索广告流水环比同期 +12%、消耗份额 +近 5pt。',
    place: 'Shanghai', org: '小红书',
  },
]

const N = chapters.length

// 每张卡片相对于 active 的偏移（用于计算位置/旋转/缩放）
function cardTransform(i, active) {
  const offset = i - active
  const abs = Math.abs(offset)
  const sign = offset === 0 ? 0 : offset / abs

  if (offset === 0) {
    return { x: 0, y: 0, rot: 0, scale: 1.08, z: 30, opacity: 1 }
  }
  if (abs === 1) {
    return { x: 230 * sign, y: 40, rot: 12 * sign, scale: 0.82, z: 20, opacity: 0.98 }
  }
  if (abs === 2) {
    return { x: 400 * sign, y: 75, rot: 22 * sign, scale: 0.68, z: 10, opacity: 0.9 }
  }
  return { x: 540 * sign, y: 110, rot: 30 * sign, scale: 0.55, z: 0, opacity: 0 }
}

// 拨盘：每个 tick 的角度（半圆布局收窄：-55° 到 +55°）
const ARC_HALF = 55
const angleFor = (i) => -ARC_HALF + (i / (N - 1)) * ARC_HALF * 2

export default function Experience() {
  const ref = useFadeIn()
  const [active, setActive] = useState(2)  // 默认停在中间那张（Master · 上外）
  const [flipped, setFlipped] = useState(false)

  const cardRefs = useRef([])
  // needleRef 已废弃，指针用 inline style 直接控制角度

  // 卡片扇形排列 GSAP 动画
  useEffect(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const t = cardTransform(i, active)
      gsap.to(el, {
        x: t.x,
        y: t.y,
        rotate: t.rot,
        scale: t.scale,
        zIndex: t.z,
        opacity: t.opacity,
        duration: 0.9,
        ease: 'power3.out',
      })
    })
  }, [active])

  const goTo = (i) => {
    if (i < 0 || i >= N) return
    if (i !== active) {
      setActive(i)
      setFlipped(false)
    } else {
      setFlipped((f) => !f)
    }
  }
  const prev = () => goTo(active - 1)
  const next = () => goTo(active + 1)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); if (active > 0) goTo(active - 1) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); if (active < N - 1) goTo(active + 1) }
      else if (e.key === 'Escape') setFlipped(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line
  }, [active])

  const c = chapters[active]

  return (
    <section id="experience" className="experience section" ref={ref}>
      <div className="container">
        <p className="section-label" data-fade>02 / Experience</p>
        <h2 className="section-title" data-fade>
          Chapters of <em>becoming</em>.
        </h2>
        <p className="experience__intro" data-fade>
          从武汉到上海，从教育、电商到内容平台 —— 每张卡片是一段章节。
          <span className="experience__hint">点击卡片 / 年份切换 · 中间卡片再点翻面看详情</span>
        </p>

        <div className="polaroid-stage" data-fade>
          {/* ========== 扇形卡片堆 ========== */}
          <div className="polaroid-fan">
            {chapters.map((ch, i) => {
              const isActive = i === active
              const isFlipped = isActive && flipped
              return (
                <div
                  key={i}
                  ref={(el) => (cardRefs.current[i] = el)}
                  className={`polaroid ${isActive ? 'polaroid--active' : ''} ${isFlipped ? 'polaroid--flipped' : ''}`}
                  onClick={() => goTo(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${ch.era} - ${ch.title}`}
                >
                  <div className="polaroid__inner">
                    {/* 正面 */}
                    <div className="polaroid__face polaroid__face--front">
                      <div
                        className="polaroid__photo"
                        style={
                          ch.photo
                            ? { backgroundImage: `url(${ch.photo})`, backgroundPosition: ch.photoObj || 'center' }
                            : { background: ch.tone }
                        }
                      >
                        {!ch.photo && (
                          <span className="polaroid__photo-placeholder" style={ch.toneInk ? { color: ch.toneInk } : null}>
                            {ch.org}
                          </span>
                        )}
                      </div>
                      <div className="polaroid__caption">
                        <h3 className="polaroid__title">{ch.title}</h3>
                        <p className="polaroid__subtitle">{ch.subtitle}</p>
                      </div>
                    </div>
                    {/* 背面 */}
                    <div className="polaroid__face polaroid__face--back">
                      <span className="polaroid__era-back">{ch.era} · {ch.year}</span>
                      <h3 className="polaroid__back-title">{ch.title}</h3>
                      <p className="polaroid__back-place">{ch.org} · <em>{ch.place}</em></p>
                      <div className="polaroid__divider" />
                      <p className="polaroid__desc">{ch.desc}</p>
                      <span className="polaroid__flip-hint">click to flip back ↻</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ========== 底部年份带（半圆弧形） ========== */}
          <div className="year-band">
            {/* stage：SVG + 标签 + 指针 + 圆心，严格 100:40 比例（扁平化弧线） */}
            <div className="year-band__stage">
              {/* 半圆弧线 + 刻度（可点击）
                  viewBox 100×40，圆心 (50, 40) 在 stage 底部中央
                  椭圆弧：rx=42, ry=26 → 弧线又扁又宽 */}
              <svg
                className="year-band__arc"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                aria-hidden="false"
              >
                {/* 主椭圆弧线（虚线） */}
                <path
                  d="M 8 40 A 42 26 0 0 1 92 40"
                  fill="none"
                  stroke="rgba(0,47,167,0.25)"
                  strokeWidth="0.3"
                  strokeDasharray="0.4 1.2"
                  vectorEffect="non-scaling-stroke"
                />

                {/* 每个 tick：外弧短线 + 透明热区 */}
              {chapters.map((_, i) => {
                const deg = angleFor(i)
                const rad = (deg - 90) * (Math.PI / 180)
                const CX = 50, CY = 40
                const RX_IN = 41, RY_IN = 25
                const RX_OUT = 44, RY_OUT = 28
                const x1 = CX + Math.cos(rad) * RX_IN
                const y1 = CY + Math.sin(rad) * RY_IN
                const x2 = CX + Math.cos(rad) * RX_OUT
                const y2 = CY + Math.sin(rad) * RY_OUT
                const RX_HIT = 47, RY_HIT = 31
                const hx = CX + Math.cos(rad) * RX_HIT
                const hy = CY + Math.sin(rad) * RY_HIT
                return (
                  <g key={i}>
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={i === active ? '#002FA7' : 'rgba(0,47,167,0.6)'}
                      strokeWidth={i === active ? '1.2' : '0.6'}
                      vectorEffect="non-scaling-stroke"
                      style={{ transition: 'stroke .3s ease, stroke-width .3s ease' }}
                    />
                    <circle
                      cx={hx} cy={hy}
                      r="3"
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onClick={() => goTo(i)}
                    >
                      <title>{chapters[i].tick}</title>
                    </circle>
                  </g>
                )
              })}

              {/* 指针：SVG 内部一条线段 + 三角箭头
                  从圆心到当前刻度内圈，共用椭圆坐标系 */}
              {(() => {
                const deg = angleFor(active)
                const rad = (deg - 90) * (Math.PI / 180)
                const CX = 50, CY = 40
                const RX_TIP = 39, RY_TIP = 23
                const tipX = CX + Math.cos(rad) * RX_TIP
                const tipY = CY + Math.sin(rad) * RY_TIP

                // 直接计算三角箭头的三个顶点（避免 SVG transform 兼容性问题）
                // 主方向单位向量（指针方向）
                const dirLen = Math.sqrt(
                  Math.pow(tipX - CX, 2) + Math.pow(tipY - CY, 2)
                ) || 1
                const dx = (tipX - CX) / dirLen
                const dy = (tipY - CY) / dirLen
                // 垂直单位向量（左右）
                const px = -dy
                const py = dx
                // 三角尺寸
                const ARROW_LEN = 3.2   // 沿箭头方向的长度
                const ARROW_HALF = 2.2  // 底边一半

                // 三顶点：尖端点(前) + 底边两侧点
                const p1x = tipX + dx * ARROW_LEN * 0.55
                const p1y = tipY + dy * ARROW_LEN * 0.55
                const baseX = tipX - dx * ARROW_LEN * 0.45
                const baseY = tipY - dy * ARROW_LEN * 0.45
                const p2x = baseX + px * ARROW_HALF
                const p2y = baseY + py * ARROW_HALF
                const p3x = baseX - px * ARROW_HALF
                const p3y = baseY - py * ARROW_HALF

                return (
                  <g>
                    {/* 指针线段 */}
                    <line
                      x1={CX} y1={CY} x2={tipX} y2={tipY}
                      stroke="#002FA7"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      style={{
                        filter: 'drop-shadow(0 0 2px rgba(0,47,167,0.5))',
                        transition: 'x2 .8s cubic-bezier(.34,1.56,.64,1), y2 .8s cubic-bezier(.34,1.56,.64,1)',
                      }}
                    />
                    {/* 三角箭头：三个顶点手动算好，转 SVG polygon */}
                    <polygon
                      points={`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`}
                      fill="#002FA7"
                      style={{
                        filter: 'drop-shadow(0 0 2px rgba(0,47,167,0.4))',
                        transition: 'points .8s cubic-bezier(.34,1.56,.64,1)',
                      }}
                    />
                  </g>
                )
              })()}
            </svg>

              {/* 年份标签：椭圆坐标系 */}
              <div className="year-band__labels">
                {chapters.map((ch, i) => {
                  const isActive = i === active
                  const deg = angleFor(i)
                  const rad = (deg - 90) * (Math.PI / 180)
                  const CX = 50, CY = 40
                  const RX_LABEL = 51, RY_LABEL = 34
                  const svgX = CX + Math.cos(rad) * RX_LABEL
                  const svgY = CY + Math.sin(rad) * RY_LABEL
                  return (
                    <button
                      key={i}
                      className={`year-label ${isActive ? 'year-label--active' : ''}`}
                      style={{
                        left: `${svgX}%`,
                        top: `${(svgY / 40) * 100}%`,
                      }}
                      onClick={() => goTo(i)}
                      aria-label={ch.tick}
                    >
                      <span className="year-label__year">{ch.tick}</span>
                      <span className="year-label__sub">{ch.era}</span>
                    </button>
                  )
                })}
              </div>

              {/* 圆心小圆点 */}
              <div className="year-band__hub" />
            </div>

            {/* foot：左右按钮 */}
            <div className="year-band__foot">
              <button
                className="year-band__nav year-band__nav--prev"
                onClick={prev}
                disabled={active === 0}
                aria-label="上一段"
              >←</button>
              <button
                className="year-band__nav year-band__nav--next"
                onClick={next}
                disabled={active === N - 1}
                aria-label="下一段"
              >→</button>
            </div>
          </div>
        </div>

        {/* 移动端 fallback */}
        <div className="arc-mobile">
          {chapters.map((c, i) => (
            <article key={i} className="arc-mobile__item" data-fade>
              <div className="arc-mobile__era">{c.era} · {c.year}</div>
              <h3>{c.title}</h3>
              <p className="arc-mobile__org">{c.subtitle} · <em>{c.place}</em></p>
              <p className="arc-mobile__desc">{c.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
