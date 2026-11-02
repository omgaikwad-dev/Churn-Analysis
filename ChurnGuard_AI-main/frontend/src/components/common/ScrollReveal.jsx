import { useEffect, useRef, useState } from 'react'

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
  distance = '24px',
  threshold = 0.08,
  once = true,
}) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once && domRef.current) {
              observer.unobserve(domRef.current)
            }
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      {
        threshold,
        rootMargin: '0px 0px -20px 0px',
      }
    )

    const currentEl = domRef.current
    if (currentEl) {
      observer.observe(currentEl)
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl)
    }
  }, [threshold, once])

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)'
    switch (direction) {
      case 'left':
        return `translate3d(-${distance}, 0, 0)`
      case 'right':
        return `translate3d(${distance}, 0, 0)`
      case 'down':
        return `translate3d(0, -${distance}, 0)`
      case 'zoom':
        return 'scale(0.96)'
      case 'up':
      default:
        return `translate3d(0, ${distance}, 0)`
    }
  }

  return (
    <div
      ref={domRef}
      className={`scroll-reveal-container ${isVisible ? 'is-visible' : 'is-hidden'} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  )
}
