import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function PageTransition({ children }) {
  const location = useLocation()
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setAnimating(true)
    const timer = setTimeout(() => {
      setAnimating(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div
      key={location.pathname}
      className={`page-sliding-transition ${animating ? 'is-animating' : 'is-ready'}`}
    >
      {children}
    </div>
  )
}
