import { Link } from "react-router"
import { Dumbbell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="flex items-center gap-2 font-medium">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Dumbbell className="size-4" />
        </div>
        IronLog
      </div>
      <div className="space-y-2">
        <p className="text-6xl font-semibold text-muted-foreground">404</p>
        <h1 className="text-xl font-medium">Stranica nije pronađena</h1>
        <p className="text-sm text-muted-foreground">
          Stranica koju tražiš ne postoji ili je premeštena.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Nazad na početnu</Link>
      </Button>
    </div>
  )
}
