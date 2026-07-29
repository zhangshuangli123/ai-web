import { useState, useEffect } from 'react'
import { useFadeIn } from '../hooks/useFadeIn.js'
import './Projects.css'

/**
 * 每张卡片的完整结构：
 * - size: 'big' | 'wide' | 'normal'（Bento 网格中的占位）
 * - accent: 主色 hint（gradient 用）
 * - context: 背景，一句话讲清楚问题
 * - action: 我做了什么（数组，2-4 条动作）
 * - stats: 关键数字（数组，正面也露出 1-2 个主打）
 * - takeaway: 学到 / 沉淀了什么
 */
const projects = [
  {
    id: 'search',
    tag: 'Search · AI Tool',
    title: '搜索场域「三轮驱动」优化 & AI 工具从 0 到 1',
    subtitle: '扩买词 + 提相关性 + 增基建',
    desc: '从数据拆解定位三大上游卡点，独立从 0 到 1 搭建搜索场域 AI 工具反哺重点客户。',
    year: '2026',
    org: '小红书',
    size: 'big',
    accent: 'blue',
    hero: { label: '搜索广告流水', value: '+12%', arrow: '·', valueTo: '消耗份额 +近 5pt' },
    context: '搜索是电商广告的核心场，但存在三大上游卡点：买词覆盖不足、笔记相关性偏低、笔记基建单一。要提升场域收入必须三线并进。',
    actions: [
      '数据拆解定位三大卡点，深度参与「扩买词 + 提相关性 + 增基建」三轮驱动优化专项',
      '独立从 0 到 1 搭建搜索场域 AI 工具，沉淀为组内工具箱',
      '反哺唯品会 / 闲鱼等重点客户词包交付，陪跑 AIGC 智能笔记改写落地',
    ],
    stats: [
      { k: '搜索广告流水', v: '环比同期 +12%' },
      { k: '消耗份额', v: '+近 5pt' },
      { k: 'AI 工具', v: '从 0 到 1 · 组内工具箱' },
      { k: '反哺客户', v: '唯品会 / 闲鱼 等' },
    ],
    takeaway: '三轮并进的关键是「哪一轮先动」——供给缺口没补齐就谈精准，效果会打折。工具化是让方法沉淀下来，不然一次性优化很快会被稀释。',
  },
  {
    id: 'kfs',
    tag: 'Client Ops',
    title: '头部电商客户 KFS 投放服务',
    subtitle: '拼多多 / 1688 / 唯品会 / 京东',
    desc: '围绕考核成本制定 KFS 组合策略，日盯盘 + 周复盘 + 月度洞察三节奏支撑客户决策。',
    year: '2026',
    org: '小红书',
    size: 'wide',
    accent: 'blue-soft',
    hero: { label: '覆盖客户', value: '4', arrow: '·', valueTo: '头部电商' },
    context: '头部客户预算大、决策链长、异常敏感。核心成本目标（消耗、CTR、转化成本）要每天盯、每周复盘、每月给到能被采信的洞察。',
    actions: [
      '围绕考核成本制定 KFS（KOL + Feeds + Search）组合策略',
      '日盯盘 + 周复盘跟踪核心指标，独立输出超成本、掉量等异常归因',
      '按月交付洞察报告支撑客户预算与投放结构决策',
    ],
    stats: [
      { k: '客户', v: '拼多多 / 1688 / 唯品 / 京东' },
      { k: '监控节奏', v: '日盯 · 周复盘 · 月洞察' },
      { k: '核心动作', v: 'KFS 组合策略' },
      { k: '异常归因', v: '超成本 · 掉量 独立输出' },
    ],
    takeaway: '客户运营的价值不在「多汇报」，而在「提前一步说清客户还没意识到的问题」。日/周/月三节奏，是让你有资格提前的门票。',
  },
  {
    id: 'event618',
    tag: 'Big Promo',
    title: '618 大促全周期陪跑',
    subtitle: '投前 · 投中 · 投后 三阶段闭环',
    desc: '承接平台电商客户 618 全周期，从大盘水位研判到 AIPS 人群洞察，三阶段闭环运营。',
    year: '2026',
    org: '小红书',
    size: 'wide',
    accent: 'gold',
    hero: { label: '大促日消耗', value: '环比稳态期 +40%', arrow: '·', valueTo: '参竞率 70%+' },
    context: '大促不是「投多点钱」的事——投前的洞察决定 KFS 冲量方案怎么排、投中的响应决定消耗节奏稳不稳、投后的复盘决定下阶段合作怎么定调。缺一环，大促就变成了「花钱做数字」。',
    actions: [
      '投前：推动 UG 激活迁移打通用增线链路，输出大盘水位与品类洞察支撑客户 KFS 冲量方案；推动提价 + 加供给 + 高 LTV 品类结构优化',
      '投中：实时盯盘调优，联动客户调价 + 补词保障消耗节奏',
      '投后：多维复盘 + AIPS 人群洞察 + 合作展望，指导客户下阶段节奏',
    ],
    stats: [
      { k: '大促日消耗', v: '环比稳态期 +40%' },
      { k: '参竞率', v: '稳定 70%+' },
      { k: '闭环阶段', v: '投前 · 投中 · 投后' },
      { k: '关键沉淀', v: 'UG 链路 · AIPS 人群洞察' },
    ],
    takeaway: '大促最容易被低估的是投前——大盘水位、品类结构、竞对策略这些「决策输入」如果没做，投中调优就变成盲人摸象。三阶段闭环不是流程好看，是每一步的产出决定下一步能不能做。',
  },
  {
    id: 'ug',
    tag: 'A/B · Product',
    title: '用增客户激活目标迁移',
    subtitle: '打通用增线新链路',
    desc: '618 投前推动 UG 从下载目标迁移到激活目标，为大促冲量打通用增线链路。',
    year: '2026',
    org: '小红书',
    size: 'normal',
    accent: 'blue',
    hero: { label: '链路', value: '下载', arrow: '→', valueTo: '激活' },
    context: '用增客户下载目标优化空间见顶，消耗增长受限。激活目标更接近业务价值，是 618 冲量必须打通的前置。',
    actions: [
      '推动客户认可迁移必要性，跑通激活目标新链路',
      '协调客户技术团队完成 SDK / 归因联调',
      '618 投前落地，为大促消耗冲量提供支撑',
    ],
    stats: [
      { k: '目标迁移', v: '下载 → 激活' },
      { k: '角色', v: '推动 + 协调' },
      { k: '落地场景', v: '618 投前' },
      { k: '价值', v: '打通用增线冲量链路' },
    ],
    takeaway: '推客户变化的核心不是讲道理，是先让他们看到「不迁移会错过什么」。大促窗口就是最好的说服工具。',
  },
  {
    id: 'sku',
    tag: 'Category Ops',
    title: '大家电 & 医疗类目「人 + 货」两端治理',
    subtitle: '卖家上新机制 + 货盘比价监控',
    desc: '针对品牌覆盖不足 + 价格竞争力弱的问题，从人和货两端并行拉升类目健康度。',
    year: '2025',
    org: '得物',
    size: 'normal',
    accent: 'grey',
    hero: { label: '低价率', value: '+近 20pt', arrow: '·', valueTo: '高价率 -15+pt' },
    context: '大家电 / 医疗类目 SKU 多、单价高、比价敏感。原品牌覆盖不完整、卖家上新意愿也不高——只治一端都会被短板卡住。',
    actions: [
      '人侧：搭建 200+ 卖家上新节奏机制，上新率 +20pt、质量分 95+ 占比 90%',
      '人侧：协同引入 6 个季增品牌、出价 SKU 季增近 1500 个',
      '货侧：按价格带 × 品牌覆盖缺口反向对接卖家上架超千级 SKU，搭建竞品比价 + 库存双监控',
    ],
    stats: [
      { k: '上新率', v: '+20pt' },
      { k: '质量分 95+ 占比', v: '90%' },
      { k: '低价率 / 高价率', v: '+近 20pt / -15+pt' },
      { k: '品牌 / SKU', v: '+6 品牌 · 季增近 1500 SKU' },
    ],
    takeaway: '货盘管理是「看不见但每天在发生」的工作。人侧管卖家的动作、货侧管价格结构，两端都不能省——健康度靠日复一日的机制，不是一次大促救回来的。',
  },
  {
    id: 'event',
    tag: 'Marketing',
    title: '「疯狂周末」周度营销节点全链路',
    subtitle: '选品动员 + 爆发复盘 两阶段闭环',
    desc: '独立统筹周度营销活动，从选品动员到四维复盘反哺下期。',
    year: '2025',
    org: '得物',
    size: 'wide',
    accent: 'gold',
    hero: { label: '单期活动 GMV 峰值', value: '涨幅超 35%', arrow: '', valueTo: '' },
    context: '活动看起来热闹，但商家愿不愿意报名、消费者愿不愿意来、复盘能不能沉淀下来，才是「真的跑起来了」。周度节奏比大促还挑机制。',
    actions: [
      '基于往期爆品结构与商家参与度制定选品与动员策略',
      '同步扫描全网竞品价盘，反向对齐商家调价',
      '活动后从爆发系数 / GMV 达成 / 漏斗转化 / 货盘结构四维度拆解复盘，输出爆品放量归因与低销诊断反哺下期',
    ],
    stats: [
      { k: '角色', v: '独立统筹' },
      { k: '闭环', v: '选品动员 → 爆发复盘' },
      { k: '单期 GMV 峰值', v: '涨幅超 35%' },
      { k: '复盘四维度', v: '爆发 · GMV · 漏斗 · 货盘' },
    ],
    takeaway: '活动做一次不难，难的是「下次别人接手也能跑起来」。复盘四维度是留给下一期的杠杆，不是给自己邀功的 PPT。',
  },
]

export default function Projects() {
  const ref = useFadeIn()
  const [openId, setOpenId] = useState(null)

  // Esc 关闭
  useEffect(() => {
    if (!openId) return
    const onKey = (e) => { if (e.key === 'Escape') setOpenId(null) }
    document.addEventListener('keydown', onKey)
    // 锁 body 滚动
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [openId])

  const openProject = projects.find(p => p.id === openId)

  return (
    <section id="projects" className="projects section" ref={ref}>
      <div className="container">
        <p className="section-label" data-fade>03 / Projects</p>
        <h2 className="section-title" data-fade>
          Things I&rsquo;m <em>building</em>.
        </h2>
        <p className="projects__intro" data-fade>
          我做过的事，以及正在想的问题。不追求「大项目」，更在意每件事有没有被认真做完。
          <span className="projects__hint">— hover 卡片，点击展开完整案例</span>
        </p>

        <div className="projects__bento">
          {projects.map((p) => (
            <button
              key={p.id}
              className={`bento-card bento-card--${p.size} bento-card--${p.accent}`}
              data-fade
              onClick={() => setOpenId(p.id)}
              aria-label={`Open case study: ${p.title}`}
            >
              <div className="bento-card__inner">
                <div className="bento-card__head">
                  <span className="bento-card__tag">{p.tag}</span>
                  <span className="bento-card__year">{p.year}</span>
                </div>

                <div className="bento-card__body">
                  <h3 className="bento-card__title">{p.title}</h3>
                  <p className="bento-card__subtitle">{p.subtitle}</p>
                </div>

                {p.hero && (
                  <div className="bento-card__hero">
                    <span className="bento-card__hero-value">{p.hero.value}</span>
                    {p.hero.arrow && (
                      <>
                        <span className="bento-card__hero-arrow">{p.hero.arrow}</span>
                        <span className="bento-card__hero-value-to">{p.hero.valueTo}</span>
                      </>
                    )}
                    <span className="bento-card__hero-label">{p.hero.label}</span>
                  </div>
                )}

                <div className="bento-card__foot">
                  <span className="bento-card__org">— {p.org}</span>
                  <span className="bento-card__cta">
                    <span className="bento-card__cta-text">展开案例</span>
                    <span className="bento-card__cta-arrow">→</span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 展开 Modal */}
      {openProject && (
        <div className="case-modal" onClick={() => setOpenId(null)}>
          <div className="case-modal__inner" onClick={(e) => e.stopPropagation()}>
            <button className="case-modal__close" onClick={() => setOpenId(null)} aria-label="Close">
              ×
            </button>

            <div className="case-modal__head">
              <span className="case-modal__tag">{openProject.tag}</span>
              <span className="case-modal__year">{openProject.year} · {openProject.org}</span>
            </div>

            <h3 className="case-modal__title">{openProject.title}</h3>
            <p className="case-modal__subtitle">{openProject.subtitle}</p>

            <div className="case-modal__grid">
              <div className="case-modal__block case-modal__block--context">
                <span className="case-modal__block-label">01 / 背景</span>
                <p className="case-modal__block-body">{openProject.context}</p>
              </div>

              <div className="case-modal__block case-modal__block--actions">
                <span className="case-modal__block-label">02 / 我做了什么</span>
                <ul className="case-modal__actions">
                  {openProject.actions.map((a, i) => (
                    <li key={i}>
                      <span className="case-modal__action-num">{String(i + 1).padStart(2, '0')}</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="case-modal__block case-modal__block--stats">
                <span className="case-modal__block-label">03 / 结果</span>
                <div className="case-modal__stats">
                  {openProject.stats.map((s, i) => (
                    <div key={i} className="case-modal__stat">
                      <span className="case-modal__stat-v">{s.v}</span>
                      <span className="case-modal__stat-k">{s.k}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="case-modal__block case-modal__block--takeaway">
                <span className="case-modal__block-label">04 / 心得</span>
                <p className="case-modal__takeaway">{openProject.takeaway}</p>
              </div>
            </div>

            <p className="case-modal__hint">按 Esc 或点击外部关闭</p>
          </div>
        </div>
      )}
    </section>
  )
}
