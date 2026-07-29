import { useEffect, useRef, useState } from 'react'
import './Envelope.css'

/**
 * Envelope —— 手写信封 + 邮票
 * - 初始状态：一封闭合的米黄信封，正面有邮票 + "To: You" 收件人标签
 * - 悬停：邮票轻微翘起 + 信封微微晃动
 * - 点击信封 → 上翻盖打开，露出信纸
 * - 信纸内容：手写体的问候语 + 邮箱
 * - 再次点击或点右上 × → 折回信封
 */
export default function Envelope({ email }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  // 键盘 Esc 关闭
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={`envelope-wrap ${open ? 'envelope-wrap--open' : ''}`} ref={wrapRef}>
      <div
        className="envelope"
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o) } }}
        aria-label={open ? '合上信封' : '打开信封查看联系方式'}
      >
        {/* 信封主体（背面） */}
        <div className="envelope__body">
          {/* 信件（在信封背面，翻盖打开后可见） */}
          <div className="envelope__letter">
            <p className="letter__hi">Dear visitor,</p>
            <p className="letter__body">
              感谢你翻到这里 —— 如果想聊聊，<br />
              可以给我写封信：
            </p>
            <div className="letter__contact">
              <a
                href={`mailto:${email}`}
                className="letter__link"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="letter__ico">✉</span>
                <span>{email}</span>
              </a>
            </div>
            <p className="letter__sign">
              期待你的来信，<br />
              <em>— Shuangli</em>
            </p>
          </div>

          {/* 底层三角折线（信封底部两个折痕） */}
          <div className="envelope__crease envelope__crease--left" />
          <div className="envelope__crease envelope__crease--right" />
        </div>

        {/* 收件人手写字（信封正面） */}
        <div className="envelope__front">
          <div className="envelope__addr">
            <span className="addr__to">To:</span>
            <span className="addr__name">The one reading ✦</span>
            <span className="addr__addr">— somewhere on the internet</span>
          </div>
        </div>

        {/* 翻盖 */}
        <div className="envelope__flap" aria-hidden="true" />

        {/* 邮票 + 邮戳（放在翻盖之上，作为独立层） */}
        <div className="envelope__stamp">
          <div className="stamp__inner">
            <div className="stamp__num">¥8</div>
            <div className="stamp__text">2026 · SHANGHAI</div>
            <div className="stamp__mark">✦</div>
          </div>
        </div>
        <div className="envelope__postmark" aria-hidden="true">
          <div className="postmark__ring">
            <span>MADE WITH CARE</span>
          </div>
        </div>
      </div>

      <p className="envelope-hint">
        {open ? '↑ 点击信封收起' : '✦ 点击信封，展开信件'}
      </p>
    </div>
  )
}