import { Component } from "react"
import { Dumbbell } from "lucide-react"

import { Button } from "@/components/ui/button"
import i18n from "@/i18n"

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
          {i18n.t("common.appName")}
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-medium">{i18n.t("errorBoundary.title")}</h1>
          <p className="text-sm text-muted-foreground">{i18n.t("errorBoundary.description")}</p>
        </div>
        <Button onClick={() => window.location.assign("/")}>
          {i18n.t("errorBoundary.backHome")}
        </Button>
      </div>
    )
  }
}
