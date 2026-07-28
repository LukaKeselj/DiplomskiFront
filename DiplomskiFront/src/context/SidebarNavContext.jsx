import { createContext, useCallback, useContext, useState } from "react"

const SidebarNavContext = createContext(null)

export function SidebarNavProvider({ children }) {
  const [openSections, setOpenSections] = useState({})

  const setSectionOpen = useCallback((title, open) => {
    setOpenSections((prev) => ({ ...prev, [title]: open }))
  }, [])

  return (
    <SidebarNavContext.Provider value={{ openSections, setSectionOpen }}>
      {children}
    </SidebarNavContext.Provider>
  )
}

export function useSidebarNav() {
  const ctx = useContext(SidebarNavContext)
  if (!ctx) {
    throw new Error("useSidebarNav must be used within SidebarNavProvider")
  }
  return ctx
}
