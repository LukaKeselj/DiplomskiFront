import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export function LanguageToggle({ className }) {
  const { t, i18n } = useTranslation()

  function toggleLanguage() {
    i18n.changeLanguage(i18n.language === "sr" ? "en" : "sr")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      aria-label={t("common.languageToggleLabel")}
      className={className}
    >
      <span className="text-xs font-semibold uppercase">
        {i18n.language === "sr" ? "EN" : "SR"}
      </span>
    </Button>
  )
}
