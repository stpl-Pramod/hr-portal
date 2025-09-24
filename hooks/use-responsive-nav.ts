import { useState, useEffect } from 'react'

export function useResponsiveNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return {
    isMobile,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu
  }
}

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '15px' // Prevent layout shift
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isLocked])
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}