import { useEffect, useRef, useState } from 'react'
import './StickerWall.css'

/**
 * StickerWall（v2 · 物理沙盒版）
 * - 便签绝对定位在软木墙上
 * - 支持鼠标拖拽（pointerdown/move/up）
 * - 松手带惯性 → 阻尼衰减
 * - 边界反弹 + 便签之间简单圆形碰撞
 * - 拖拽时自动 z-index 置顶
 * - hover 便签轻微翘起
 */
export default function StickerWall({ items }) {
  const wallRef = useRef(null)
  const stickerRefs = useRef([])
  const [state] = useState(() => ({ initialized: false }))
  const engineRef = useRef({ balls: [], raf: 0, wallW: 0, wallH: 0, drag: null })

  useEffect(() => {
    const wall = wallRef.current
    if (!wall) return

    // 初始化便签位置
    const wallRect = wall.getBoundingClientRect()
    const wallW = wallRect.width
    const wallH = wallRect.height
    engineRef.current.wallW = wallW
    engineRef.current.wallH = wallH

    const balls = items.map((_, i) => {
      const el = stickerRefs.current[i]
      if (!el) return null
      const w = el.offsetWidth
      const h = el.offsetHeight
      const r = Math.max(w, h) * 0.55 // 碰撞半径
      // 初始位置：网格式随机散布
      const cols = 4
      const col = i % cols
      const row = Math.floor(i / cols)
      const cellW = (wallW - 40) / cols
      const cellH = 220
      const x = 20 + col * cellW + (cellW - w) / 2 + (Math.random() - 0.5) * 40
      const y = 30 + row * cellH + (Math.random() - 0.5) * 30
      const rot = (Math.random() - 0.5) * 10 // 初始旋转 -5°~+5°
      return {
        el, x, y, w, h, r, rot,
        vx: 0, vy: 0, vrot: 0,
        targetRot: rot,
      }
    }).filter(Boolean)
    engineRef.current.balls = balls
    applyTransforms(balls)

    // 事件绑定
    const onPointerDown = (e) => {
      const target = e.target.closest('.sticker')
      if (!target) return
      const idx = Number(target.dataset.idx)
      const ball = balls[idx]
      if (!ball) return
      e.preventDefault()
      const wallRect = wall.getBoundingClientRect()
      engineRef.current.drag = {
        ball,
        offsetX: e.clientX - wallRect.left - ball.x,
        offsetY: e.clientY - wallRect.top - ball.y,
        lastX: e.clientX,
        lastY: e.clientY,
        lastT: performance.now(),
        vx: 0, vy: 0,
        moved: false,
      }
      target.classList.add('sticker--dragging')
      target.style.zIndex = 100
    }

    const onPointerMove = (e) => {
      const drag = engineRef.current.drag
      if (!drag) return
      const wallRect = wall.getBoundingClientRect()
      const nx = e.clientX - wallRect.left - drag.offsetX
      const ny = e.clientY - wallRect.top - drag.offsetY
      drag.ball.x = nx
      drag.ball.y = ny
      const now = performance.now()
      const dt = Math.max(1, now - drag.lastT)
      drag.vx = (e.clientX - drag.lastX) / dt * 16 // 归一到 60fps
      drag.vy = (e.clientY - drag.lastY) / dt * 16
      drag.lastX = e.clientX
      drag.lastY = e.clientY
      drag.lastT = now
      if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) drag.moved = true
      applyTransforms(balls)
    }

    const onPointerUp = (e) => {
      const drag = engineRef.current.drag
      if (!drag) return
      const target = drag.ball.el
      target.classList.remove('sticker--dragging')
      // 释放惯性
      drag.ball.vx = clamp(drag.vx, -30, 30)
      drag.ball.vy = clamp(drag.vy, -30, 30)
      drag.ball.vrot = (Math.random() - 0.5) * 6 * (Math.abs(drag.vx) + Math.abs(drag.vy)) / 20
      engineRef.current.drag = null

      // 如果没怎么移动过，视为点击 → 让默认链接行为发生
      if (!drag.moved && target.tagName === 'A') {
        // do nothing, browser handles click
      } else {
        // 阻止误触发链接
        target.dataset.preventClick = '1'
        setTimeout(() => { delete target.dataset.preventClick }, 100)
      }
    }

    // 阻止拖拽后误点链接
    const onClick = (e) => {
      const target = e.target.closest('.sticker')
      if (target?.dataset.preventClick === '1') {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    wall.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    wall.addEventListener('click', onClick, true)

    // Resize
    const onResize = () => {
      const rect = wall.getBoundingClientRect()
      engineRef.current.wallW = rect.width
      engineRef.current.wallH = rect.height
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(wall)

    // 动画循环
    const damping = 0.94
    const wallBounce = 0.75

    const tick = () => {
      engineRef.current.raf = requestAnimationFrame(tick)
      const { balls, wallW, wallH, drag } = engineRef.current

      // 球球碰撞（简单圆形）
      for (let i = 0; i < balls.length; i++) {
        const a = balls[i]
        for (let j = i + 1; j < balls.length; j++) {
          const b = balls[j]
          // 使用中心点计算
          const ax = a.x + a.w / 2
          const ay = a.y + a.h / 2
          const bx = b.x + b.w / 2
          const by = b.y + b.h / 2
          const dx = bx - ax
          const dy = by - ay
          const dist2 = dx * dx + dy * dy
          const minDist = (a.r + b.r) * 0.6
          if (dist2 < minDist * minDist && dist2 > 0.01) {
            const dist = Math.sqrt(dist2)
            const nx = dx / dist
            const ny = dy / dist
            const overlap = (minDist - dist) * 0.5
            if (!drag || drag.ball !== a) { a.x -= nx * overlap; a.y -= ny * overlap }
            if (!drag || drag.ball !== b) { b.x += nx * overlap; b.y += ny * overlap }
            const rvx = b.vx - a.vx
            const rvy = b.vy - a.vy
            const velN = rvx * nx + rvy * ny
            if (velN < 0) {
              const impulse = -velN * 0.9
              if (!drag || drag.ball !== a) { a.vx -= impulse * nx; a.vy -= impulse * ny }
              if (!drag || drag.ball !== b) { b.vx += impulse * nx; b.vy += impulse * ny }
              // 旋转扰动
              a.vrot += (Math.random() - 0.5) * 2
              b.vrot += (Math.random() - 0.5) * 2
            }
          }
        }
      }

      // 更新位置
      let anyMoving = false
      for (const ball of balls) {
        if (drag && drag.ball === ball) continue
        ball.vx *= damping
        ball.vy *= damping
        ball.vrot *= 0.92
        ball.x += ball.vx
        ball.y += ball.vy
        ball.rot += ball.vrot
        // 边界反弹
        if (ball.x < 0) { ball.x = 0; ball.vx = Math.abs(ball.vx) * wallBounce; ball.vrot *= -1 }
        if (ball.y < 0) { ball.y = 0; ball.vy = Math.abs(ball.vy) * wallBounce; ball.vrot *= -1 }
        if (ball.x + ball.w > wallW) { ball.x = wallW - ball.w; ball.vx = -Math.abs(ball.vx) * wallBounce; ball.vrot *= -1 }
        if (ball.y + ball.h > wallH) { ball.y = wallH - ball.h; ball.vy = -Math.abs(ball.vy) * wallBounce; ball.vrot *= -1 }
        // 判断是否还在动
        if (Math.abs(ball.vx) > 0.05 || Math.abs(ball.vy) > 0.05 || Math.abs(ball.vrot) > 0.05) {
          anyMoving = true
        } else {
          ball.vx = 0; ball.vy = 0; ball.vrot = 0
        }
      }
      applyTransforms(balls)
    }
    engineRef.current.raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(engineRef.current.raf)
      wall.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      wall.removeEventListener('click', onClick, true)
      ro.disconnect()
    }
  }, [items, state])

  const reset = () => {
    const balls = engineRef.current.balls
    const wallW = engineRef.current.wallW
    balls.forEach((ball, i) => {
      const cols = 4
      const col = i % cols
      const row = Math.floor(i / cols)
      const cellW = (wallW - 40) / cols
      ball.x = 20 + col * cellW + (cellW - ball.w) / 2 + (Math.random() - 0.5) * 40
      ball.y = 30 + row * 220 + (Math.random() - 0.5) * 30
      ball.rot = (Math.random() - 0.5) * 10
      ball.vx = (Math.random() - 0.5) * 6
      ball.vy = (Math.random() - 0.5) * 4
      ball.vrot = (Math.random() - 0.5) * 4
    })
    applyTransforms(balls)
  }

  return (
    <div className="sticker-wall">
      <div className="sticker-wall__hint">
        <span>✦ drag any note · toss it around</span>
        <button className="sticker-wall__reset" onClick={reset}>↻ reset</button>
      </div>
      <div className="sticker-wall__stage" ref={wallRef}>
        {items.map((it, i) => {
          const Tag = it.href ? 'a' : 'div'
          return (
            <Tag
              key={i}
              ref={(el) => (stickerRefs.current[i] = el)}
              data-idx={i}
              className={`sticker sticker--${it.color || 'yellow'} ${it.size ? `sticker--${it.size}` : ''}`}
              {...(it.href ? { href: it.href, target: it.external ? '_blank' : undefined, rel: 'noreferrer' } : {})}
            >
              {it.pin !== false && <span className="sticker__pin" aria-hidden="true" />}
              {it.label && <span className="sticker__label">{it.label}</span>}
              {it.title && <span className="sticker__title">{it.title}</span>}
              {it.text && <span className="sticker__text">{it.text}</span>}
              {it.footer && <span className="sticker__footer">{it.footer}</span>}
            </Tag>
          )
        })}
      </div>
    </div>
  )
}

function applyTransforms(balls) {
  for (const ball of balls) {
    ball.el.style.transform = `translate(${ball.x}px, ${ball.y}px) rotate(${ball.rot}deg)`
  }
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v
}