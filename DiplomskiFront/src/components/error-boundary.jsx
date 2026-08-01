import { Component } from "react"
import { Dumbbell } from "lucide-react"

import { Button } from "@/components/ui/button"

export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex items-center gap-2 font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Dumbbell className="size-4" />
          </div>
          IronLog
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-medium">Nešto je pošlo po zlu</h1>
          <p className="text-sm text-muted-foreground">
            Došlo je do neočekivane greške. Osveži stranicu i pokušaj ponovo.
          </p>
        </div>
        <Button onClick={() => window.location.assign("/")}>Nazad na početnu</Button>
      </div>
    )
  }
}
