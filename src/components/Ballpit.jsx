import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Ballpit —— 轻量 3D 球池
 * 灵感来自 Grace 的 Ballpit，实现完全原创：
 * - 无 cannon-es 物理引擎（自写 O(n²) 简易碰撞）
 * - Three.js Mesh + SphereGeometry + MeshPhysicalMaterial
 * - 鼠标斥力场：hover 60px 内推开球
 * - IntersectionObserver 懒挂载，prefers-reduced-motion 降级
 */
export default function Ballpit({
  count = 60,
  gravity = 0.15,
  friction = 0.988,
  wallBounce = 0.75,
  mouseForce = 0.6,
  mouseRadius = 1.8,
  colors = ['#002FA7', '#1A47C9', '#3D6AE8', '#C9A962', '#e5e5e5', '#f0f0f0'],
  minRadius = 0.35,
  maxRadius = 0.9,
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // reduced motion 降级
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    let width = container.clientWidth
    let height = container.clientHeight

    // Scene / camera / renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(0, 0, 12)
    scene.add(camera)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, failIfMajorPerformanceCaveat: false })
    } catch (e) {
      console.warn('[Ballpit] WebGL not available, skipping.', e)
      return
    }
    if (!renderer || !renderer.getContext()) {
      console.warn('[Ballpit] WebGL context creation failed, skipping.')
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'

    // 光源
    const ambient = new THREE.AmbientLight(0xffffff, 0.75)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(2, 4, 5)
    scene.add(dir)
    const point = new THREE.PointLight(0x3d6ae8, 0.6, 20)
    point.position.set(-3, 2, 3)
    scene.add(point)

    // 视口边界（世界坐标，z=0 平面）
    // 通过 camera 计算 z=0 平面的可见范围
    const fovRad = (camera.fov * Math.PI) / 180
    const worldH = 2 * Math.tan(fovRad / 2) * camera.position.z
    const worldW = worldH * camera.aspect
    const bounds = {
      minX: -worldW / 2,
      maxX: worldW / 2,
      minY: -worldH / 2,
      maxY: worldH / 2,
    }

    // 创建球
    const balls = []
    const geom = new THREE.SphereGeometry(1, 24, 20)
    const colorObjs = colors.map((c) => new THREE.Color(c))

    for (let i = 0; i < count; i++) {
      const r = minRadius + Math.random() * (maxRadius - minRadius)
      const color = colorObjs[Math.floor(Math.random() * colorObjs.length)]
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.45,
        roughness: 0.4,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.scale.setScalar(r)
      mesh.position.set(
        bounds.minX + Math.random() * worldW,
        bounds.minY + Math.random() * worldH,
        (Math.random() - 0.5) * 0.5,
      )
      scene.add(mesh)
      balls.push({
        mesh,
        r,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
      })
    }

    // 鼠标状态（世界坐标）
    const mouse = { x: 999, y: 999, active: false }

    function onPointerMove(e) {
      const rect = container.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1
      mouse.x = nx * (worldW / 2)
      mouse.y = ny * (worldH / 2)
      mouse.active = true
    }
    function onPointerLeave() {
      mouse.active = false
      mouse.x = 999
      mouse.y = 999
    }
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerleave', onPointerLeave)

    // 触摸支持
    function onTouchMove(e) {
      if (e.touches.length === 0) return
      onPointerMove(e.touches[0])
    }
    container.addEventListener('touchmove', onTouchMove, { passive: true })

    // Resize
    function onResize() {
      width = container.clientWidth
      height = container.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      const wh = 2 * Math.tan(fovRad / 2) * camera.position.z
      const ww = wh * camera.aspect
      bounds.minX = -ww / 2
      bounds.maxX = ww / 2
      bounds.minY = -wh / 2
      bounds.maxY = wh / 2
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)

    // 动画循环
    let rafId = 0
    let running = true

    // IntersectionObserver：不可见就暂停节能
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting
      },
      { threshold: 0 },
    )
    io.observe(container)

    function tick() {
      rafId = requestAnimationFrame(tick)
      if (!running) return

      // 1. 施力：重力 + 鼠标斥力
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i]
        b.vy -= gravity * 0.01

        if (mouse.active) {
          const dx = b.mesh.position.x - mouse.x
          const dy = b.mesh.position.y - mouse.y
          const dist2 = dx * dx + dy * dy
          const rad = mouseRadius
          if (dist2 < rad * rad && dist2 > 0.0001) {
            const dist = Math.sqrt(dist2)
            const strength = (1 - dist / rad) * mouseForce
            b.vx += (dx / dist) * strength * 0.05
            b.vy += (dy / dist) * strength * 0.05
          }
        }
      }

      // 2. 球球碰撞（简易弹性）
      for (let i = 0; i < balls.length; i++) {
        const a = balls[i]
        for (let j = i + 1; j < balls.length; j++) {
          const b = balls[j]
          const dx = b.mesh.position.x - a.mesh.position.x
          const dy = b.mesh.position.y - a.mesh.position.y
          const minDist = a.r + b.r
          const dist2 = dx * dx + dy * dy
          if (dist2 < minDist * minDist && dist2 > 0.0001) {
            const dist = Math.sqrt(dist2)
            const nx = dx / dist
            const ny = dy / dist
            const overlap = (minDist - dist) * 0.5
            a.mesh.position.x -= nx * overlap
            a.mesh.position.y -= ny * overlap
            b.mesh.position.x += nx * overlap
            b.mesh.position.y += ny * overlap
            // 相对速度沿法线的分量交换（假设等质量）
            const rvx = b.vx - a.vx
            const rvy = b.vy - a.vy
            const velN = rvx * nx + rvy * ny
            if (velN < 0) {
              const bounce = 0.9
              const impulse = -velN * bounce
              a.vx -= impulse * nx
              a.vy -= impulse * ny
              b.vx += impulse * nx
              b.vy += impulse * ny
            }
          }
        }
      }

      // 3. 更新位置 + 边界反弹 + 阻尼
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i]
        b.vx *= friction
        b.vy *= friction
        // 限制最大速度
        const speed2 = b.vx * b.vx + b.vy * b.vy
        const maxSpeed = 0.3
        if (speed2 > maxSpeed * maxSpeed) {
          const s = maxSpeed / Math.sqrt(speed2)
          b.vx *= s
          b.vy *= s
        }
        b.mesh.position.x += b.vx
        b.mesh.position.y += b.vy

        if (b.mesh.position.x - b.r < bounds.minX) {
          b.mesh.position.x = bounds.minX + b.r
          b.vx = Math.abs(b.vx) * wallBounce
        } else if (b.mesh.position.x + b.r > bounds.maxX) {
          b.mesh.position.x = bounds.maxX - b.r
          b.vx = -Math.abs(b.vx) * wallBounce
        }
        if (b.mesh.position.y - b.r < bounds.minY) {
          b.mesh.position.y = bounds.minY + b.r
          b.vy = Math.abs(b.vy) * wallBounce
        } else if (b.mesh.position.y + b.r > bounds.maxY) {
          b.mesh.position.y = bounds.maxY - b.r
          b.vy = -Math.abs(b.vy) * wallBounce
        }
      }

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(rafId)
      io.disconnect()
      ro.disconnect()
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerleave', onPointerLeave)
      container.removeEventListener('touchmove', onTouchMove)
      balls.forEach((b) => {
        scene.remove(b.mesh)
        b.mesh.material.dispose()
      })
      geom.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [count, gravity, friction, wallBounce, mouseForce, mouseRadius, colors, minRadius, maxRadius])

  return <div ref={containerRef} className="ballpit-canvas" />
}