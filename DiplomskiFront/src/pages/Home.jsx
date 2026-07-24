import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function Home() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-6">
      <p className="text-lg">
        Ulogovan si kao <span className="font-medium">{user?.email}</span>
      </p>
      <Button variant="outline" onClick={logout}>
        Logout
      </Button>
    </div>
  )
}
