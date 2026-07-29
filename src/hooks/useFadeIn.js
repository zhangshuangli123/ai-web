import { useEffect, useRef } from 'react'

// 通用滚动淡入 Hook：给 ref 上的元素及其 [data-fade] 子元素加 IntersectionObserver
export function useFadeIn() {
  const rootRef = useRef(null)

  useEffect(() => {
    if (!rootRef.current) return
    const targets = rootRef.current.querySelectorAll('[data-fade], .fade-in')
    targets.forEach((el) => el.classList.add('fade-in'))

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return rootRef
}
