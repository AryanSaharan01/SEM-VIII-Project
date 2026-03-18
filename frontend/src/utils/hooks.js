import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// ─── Debounce Hook ────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export function useDebouncedCallback(callback, delay = 300) {
  const timerRef = useRef(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const debouncedFn = useCallback((...args) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => callbackRef.current(...args), delay)
  }, [delay])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])
  return debouncedFn
}

// ─── Throttle Hook ────────────────────────────────────────────────────────────
export function useThrottle(value, interval = 200) {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdated = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    if (now - lastUpdated.current >= interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - (now - lastUpdated.current))
      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}

export function useThrottledCallback(callback, interval = 200) {
  const lastRan = useRef(0)
  const timerRef = useRef(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const throttledFn = useCallback((...args) => {
    const now = Date.now()
    const remaining = interval - (now - lastRan.current)
    if (remaining <= 0) {
      lastRan.current = now
      callbackRef.current(...args)
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        lastRan.current = Date.now()
        callbackRef.current(...args)
      }, remaining)
    }
  }, [interval])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])
  return throttledFn
}

// ─── Intersection Observer for scroll animations ─────────────────────────────
export function useInView(options = {}) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (options.once !== false) observer.unobserve(element)
        } else if (options.once === false) {
          setIsInView(false)
        }
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin, options.once])

  return [ref, isInView]
}

// ─── Mouse Position (throttled) ──────────────────────────────────────────────
export function useMousePosition(throttleMs = 50) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const lastUpdate = useRef(0)

  useEffect(() => {
    const handler = (e) => {
      const now = Date.now()
      if (now - lastUpdate.current >= throttleMs) {
        lastUpdate.current = now
        setPos({ x: e.clientX, y: e.clientY })
      }
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [throttleMs])

  return pos
}
