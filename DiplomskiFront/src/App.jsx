import { AppRoutes } from "@/routes/AppRoutes"
import { SidebarNavProvider } from "@/context/SidebarNavContext"

const App = () => {
  return (
    <SidebarNavProvider>
      <AppRoutes />
    </SidebarNavProvider>
  )
}

export default App
