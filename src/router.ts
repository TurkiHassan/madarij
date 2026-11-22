import { useEffect, useState } from 'react'

export function useRoute() {
  const [route, setRoute] = useState(() => location.hash.replace(/^#/, '') || '/')
  useEffect(() => {
    const onChange = () => setRoute(location.hash.replace(/^#/, '') || '/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function go(path: string) {
  if (location.hash === `#${path}`) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  location.hash = path
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function routeParts(route: string): string[] {
  return route.split('/').filter(Boolean)
}
