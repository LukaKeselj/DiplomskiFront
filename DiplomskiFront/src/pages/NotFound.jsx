import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import { Dumbbell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="absolute top-4 right-4 flex gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="flex items-center gap-2 font-medium">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Dumbbell className="size-4" />
        </div>
        {t("common.appName")}
      </div>
      <div className="space-y-2">
        <p className="text-6xl font-semibold text-muted-foreground">404</p>
        <h1 className="text-xl font-medium">{t("notFound.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("notFound.description")}</p>
      </div>
      <Button asChild>
        <Link to="/">{t("notFound.backHome")}</Link>
      </Button>
    </div>
  )
}
