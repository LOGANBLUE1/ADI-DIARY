import { useState, useEffect, useRef } from 'react'

export const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)
  const open = () => setIsOpen(true)

  return { isOpen, toggle, close, open, containerRef }
}
