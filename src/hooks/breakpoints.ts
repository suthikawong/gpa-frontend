import { useEffect, useState } from 'react'

export function useBreakpoints() {
  const [breakpoints, setBreakpoints] = useState({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  })

  useEffect(() => {
    const queries = {
      sm: window.matchMedia('(min-width: 640px)'),
      md: window.matchMedia('(min-width: 768px)'),
      lg: window.matchMedia('(min-width: 1024px)'),
      xl: window.matchMedia('(min-width: 1280px)'),
      '2xl': window.matchMedia('(min-width: 1536px)'),
    }

    const update = () => {
      setBreakpoints({
        sm: queries.sm.matches,
        md: queries.md.matches,
        lg: queries.lg.matches,
        xl: queries.xl.matches,
        '2xl': queries['2xl'].matches,
      })
    }

    update()

    Object.values(queries).forEach((query) => query.addEventListener('change', update))

    return () => {
      Object.values(queries).forEach((query) => query.removeEventListener('change', update))
    }
  }, [])

  return breakpoints
}
