import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import {
  Apple,
  ArrowRight,
  Dumbbell,
  Gauge,
  ListChecks,
  Pill,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { MotionSection } from "@/components/ui/motion-section"

const featureIcons = [
  { key: "workoutPlans", icon: Dumbbell },
  { key: "exerciseLibrary", icon: ListChecks },
  { key: "fitnessScore", icon: Gauge },
  { key: "nutritionLog", icon: Apple },
  { key: "supplements", icon: Pill },
  { key: "progressTracking", icon: TrendingUp },
]

export default function Landing() {
  const { t } = useTranslation()

  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between p-6 md:px-10">
        <div className="flex items-center gap-2 font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Dumbbell className="size-4" />
          </div>
          {t("common.appName")}
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Button asChild variant="outline">
            <Link to="/login">{t("landing.login")}</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute top-1/2 right-0 -z-10 size-[36rem] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl" />
          <MotionSection className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-10 md:py-24 lg:py-28">
            <div className="flex flex-col gap-6">
              <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {t("landing.badge")}
              </span>
              <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                {t("landing.heroTitle")}
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                {t("landing.heroDescription")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/login">
                    {t("landing.login")}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/register">{t("landing.createAccount")}</Link>
                </Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-foreground/10">
              <img
                src="/images/teretana.jpeg"
                alt={t("common.gymAlt")}
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
          </MotionSection>
        </section>

        <section className="border-y bg-muted/30">
          <MotionSection className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
            <div className="mb-10 flex flex-col items-center gap-2 text-center">
              <h2 className="font-heading text-2xl font-semibold md:text-3xl">
                {t("landing.featuresTitle")}
              </h2>
              <p className="max-w-md text-muted-foreground">
                {t("landing.featuresDescription")}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureIcons.map(({ key, icon: Icon }) => (
                <div
                  key={key}
                  className="flex flex-col gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-medium">{t(`landing.features.${key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`landing.features.${key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </MotionSection>
        </section>

        <MotionSection className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-16 text-center md:px-10 md:py-24">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">
            {t("landing.ctaTitle")}
          </h2>
          <p className="max-w-md text-muted-foreground">{t("landing.ctaDescription")}</p>
          <Button asChild size="lg">
            <Link to="/login">
              {t("landing.login")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </MotionSection>
      </main>
    </div>
  )
}
