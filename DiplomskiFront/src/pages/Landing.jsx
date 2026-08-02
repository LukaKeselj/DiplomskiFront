import { Link } from "react-router"
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
import { MotionSection } from "@/components/ui/motion-section"

const features = [
  {
    icon: Dumbbell,
    title: "Planovi treninga",
    description: "Napravi sopstveni plan treninga ili prati gotove programe po danima.",
  },
  {
    icon: ListChecks,
    title: "Baza vežbi",
    description: "Pretraži vežbe po mišićnim grupama i prati napredak za svaku od njih.",
  },
  {
    icon: Gauge,
    title: "Fitness Score",
    description: "Jedan broj koji sažima trening, ishranu i telesnu težinu za svaki dan.",
  },
  {
    icon: Apple,
    title: "Dnevnik ishrane",
    description: "Vodi evidenciju obroka i prati unos kalorija i makronutrijenata.",
  },
  {
    icon: Pill,
    title: "Suplementi",
    description: "Organizuj svoj režim suplementacije i ne propusti nijedan unos.",
  },
  {
    icon: TrendingUp,
    title: "Praćenje napretka",
    description: "Grafici telesne težine i napretka na vežbama kroz vreme.",
  },
]

export default function Landing() {
  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between p-6 md:px-10">
        <div className="flex items-center gap-2 font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Dumbbell className="size-4" />
          </div>
          IronLog
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline">
            <Link to="/login">Prijavi se</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute top-1/2 right-0 -z-10 size-[36rem] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl" />
          <MotionSection className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-10 md:py-24 lg:py-28">
            <div className="flex flex-col gap-6">
              <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Tvoj lični fitness pratilac
              </span>
              <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                Trening, ishrana i napredak na jednom mestu
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                IronLog je aplikacija koja ti pomaže da isplaniraš treninge, pratiš ishranu i
                suplemente i vidiš svoj napredak kroz vreme &mdash; sve na jednom mestu.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/login">
                    Prijavi se
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/register">Napravi nalog</Link>
                </Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-foreground/10">
              <img
                src="/images/teretana.jpeg"
                alt="Teretana"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
          </MotionSection>
        </section>

        <section className="border-y bg-muted/30">
          <MotionSection className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
            <div className="mb-10 flex flex-col items-center gap-2 text-center">
              <h2 className="font-heading text-2xl font-semibold md:text-3xl">
                Sve što ti treba na jednom mestu
              </h2>
              <p className="max-w-md text-muted-foreground">
                Od planiranja treninga do praćenja napretka &mdash; bez žongliranja između
                aplikacija.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </MotionSection>
        </section>

        <MotionSection className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-16 text-center md:px-10 md:py-24">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">
            Spreman da počneš?
          </h2>
          <p className="max-w-md text-muted-foreground">
            Prijavi se i preuzmi kontrolu nad svojim treninzima i ishranom.
          </p>
          <Button asChild size="lg">
            <Link to="/login">
              Prijavi se
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </MotionSection>
      </main>
    </div>
  )
}
