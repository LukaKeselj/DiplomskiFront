import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./locales/en.json"
import sr from "./locales/sr.json"

const STORAGE_KEY = "language"

function getInitialLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === "en" || stored === "sr" ? stored : "sr"
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sr: { translation: sr },
  },
  lng: getInitialLanguage(),
  fallbackLng: "sr",
  interpolation: {
    escapeValue: false,
  },
})

i18n.on("languageChanged", (language) => {
  localStorage.setItem(STORAGE_KEY, language)
})

export default i18n
