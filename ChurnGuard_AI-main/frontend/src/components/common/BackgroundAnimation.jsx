import { useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

export default function BackgroundAnimation() {
  const canvasRef = useRef(null)
  const { activeTheme } = useTheme()
  const themeRgbRef = useRef(activeTheme?.rgb || '16, 185, 129')

  useEffect(() => {
    themeRgbRef.current = activeTheme?.rgb || '16, 185, 129'
  }, [activeTheme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    let mouse = { x: -1000, y: -1000, active: false }

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }

    const handleMouseLeave = () => {
      mouse.active = false
    }

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    // Lightweight particle network: 26 particles is optimal for zero-lag smooth 60fps
    const particleCount = 26
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1.0,
        alpha: Math.random() * 0.35 + 0.15,
      })
    }

    // High performance render loop (Zero shadowBlur rasterization, zero heavy fillRects)
    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)
      const rgb = themeRgbRef.current

      // 1. Update and draw particles
      for (let i = 0; i < particleCount; i++) {
        const p1 = particles[i]

        p1.x += p1.vx
        p1.y += p1.vy

        if (p1.x < 0) p1.x = width
        if (p1.x > width) p1.x = 0
        if (p1.y < 0) p1.y = height
        if (p1.y > height) p1.y = 0

        // Soft cursor influence
        if (mouse.active) {
          const dx = mouse.x - p1.x
          const dy = mouse.y - p1.y
          const distSq = dx * dx + dy * dy
          if (distSq < 14400) {
            // dist < 120
            const dist = Math.sqrt(distSq)
            const force = (120 - dist) / 120
            p1.x -= (dx / dist) * force * 1.2
            p1.y -= (dy / dist) * force * 1.2
          }
        }

        // Lightweight hardware-friendly particle dot with subtle outer glow
        ctx.beginPath()
        ctx.arc(p1.x, p1.y, p1.radius * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb}, ${p1.alpha * 0.2})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb}, ${p1.alpha})`
        ctx.fill()

        // Connect nearby particles
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distSq = dx * dx + dy * dy

          if (distSq < 9025) {
            // dist < 95
            const dist = Math.sqrt(distSq)
            const lineAlpha = (1 - dist / 95) * 0.14
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(${rgb}, ${lineAlpha})`
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      }

      // 2. Cursor proximity lines to nearest nodes only
      if (mouse.active) {
        for (let i = 0; i < particleCount; i++) {
          const p = particles[i]
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const distSq = dx * dx + dy * dy
          if (distSq < 10000) {
            // dist < 100
            const dist = Math.sqrt(distSq)
            const lineAlpha = (1 - dist / 100) * 0.22
            ctx.beginPath()
            ctx.moveTo(mouse.x, mouse.y)
            ctx.lineTo(p.x, p.y)
            ctx.strokeStyle = `rgba(${rgb}, ${lineAlpha})`
            ctx.lineWidth = 0.9
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="animated-background-wrapper" aria-hidden="true">
      {/* 1. Fast GPU-composited Aurora Orbs without heavy CSS blur filters */}
      <div className="aurora-orb orb-1" />
      <div className="aurora-orb orb-2" />

      {/* 2. Cyber matrix grid background lines */}
      <div className="cyber-grid-overlay" />

      {/* 3. High performance particle canvas */}
      <canvas ref={canvasRef} className="interactive-particles-canvas" />
    </div>
  )
}
