import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Pause, Play, RotateCcw, SkipForward, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { NumberScrollField } from "@/components/ui/number-scroll-field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

function formatStopwatch(ms) {
  const totalCentis = Math.floor(ms / 10)
  const minutes = Math.floor(totalCentis / 6000)
  const seconds = Math.floor((totalCentis % 6000) / 100)
  const centis = totalCentis % 100
  return {
    time: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    centis: String(centis).padStart(2, "0"),
  }
}

function formatCountdown(ms) {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function playBeep(frequency) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioContextClass()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.frequency.value = frequency
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.3)
    oscillator.onended = () => ctx.close()
  } catch {
    // audio not available, ignore
  }
}

function nextPhase(phase, set, sets) {
  if (phase === "work") {
    return set >= sets ? { phase: "done", set } : { phase: "rest", set }
  }
  if (phase === "rest") {
    return { phase: "work", set: set + 1 }
  }
  return { phase: "done", set }
}

function StopwatchTab() {
  const { t } = useTranslation()
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    if (!isRunning) return

    startRef.current = Date.now() - elapsed
    const interval = setInterval(() => {
      setElapsed(Date.now() - startRef.current)
    }, 10)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  function handleToggle() {
    setIsRunning((prev) => !prev)
  }

  function handleReset() {
    setIsRunning(false)
    setElapsed(0)
  }

  const { time, centis } = formatStopwatch(elapsed)

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-2">
      <div
        className={cn(
          "font-mono text-4xl font-semibold tabular-nums",
          isRunning ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {time}
        <span className="text-xl text-muted-foreground">.{centis}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={handleToggle}>
          {isRunning ? <Pause /> : <Play />}
          {isRunning
            ? t("home.stopwatchWidget.stopwatch.pause")
            : elapsed > 0
              ? t("home.stopwatchWidget.stopwatch.resume")
              : t("home.stopwatchWidget.stopwatch.start")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={elapsed === 0 && !isRunning}
        >
          <RotateCcw />
          {t("home.stopwatchWidget.stopwatch.reset")}
        </Button>
      </div>
    </div>
  )
}

function IntervalTab() {
  const { t } = useTranslation()
  const [sets, setSets] = useState(3)
  const [workSeconds, setWorkSeconds] = useState(30)
  const [restSeconds, setRestSeconds] = useState(60)

  const [phase, setPhase] = useState("idle")
  const [currentSet, setCurrentSet] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [remainingMs, setRemainingMs] = useState(0)
  const phaseEndRef = useRef(null)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const remaining = phaseEndRef.current - Date.now()
      if (remaining > 0) {
        setRemainingMs(remaining)
        return
      }

      const upcoming = nextPhase(phase, currentSet, sets)
      if (upcoming.phase === "done") {
        setIsRunning(false)
        setPhase("done")
        setRemainingMs(0)
        playBeep(988)
        return
      }

      const duration = (upcoming.phase === "work" ? workSeconds : restSeconds) * 1000
      phaseEndRef.current = Date.now() + duration
      setPhase(upcoming.phase)
      setCurrentSet(upcoming.set)
      setRemainingMs(duration)
      playBeep(upcoming.phase === "work" ? 880 : 440)
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, phase, currentSet, sets, workSeconds, restSeconds])

  function handleStart() {
    if (phase === "idle" || phase === "done") {
      setPhase("work")
      setCurrentSet(1)
      const duration = workSeconds * 1000
      phaseEndRef.current = Date.now() + duration
      setRemainingMs(duration)
      playBeep(880)
    } else {
      phaseEndRef.current = Date.now() + remainingMs
    }
    setIsRunning(true)
  }

  function handlePause() {
    setIsRunning(false)
  }

  function handleReset() {
    setIsRunning(false)
    setPhase("idle")
    setCurrentSet(1)
    setRemainingMs(0)
  }

  function handleSkip() {
    const upcoming = nextPhase(phase, currentSet, sets)
    if (upcoming.phase === "done") {
      setIsRunning(false)
      setPhase("done")
      setRemainingMs(0)
      playBeep(988)
      return
    }
    const duration = (upcoming.phase === "work" ? workSeconds : restSeconds) * 1000
    phaseEndRef.current = Date.now() + duration
    setPhase(upcoming.phase)
    setCurrentSet(upcoming.set)
    setRemainingMs(duration)
    playBeep(upcoming.phase === "work" ? 880 : 440)
  }

  const isConfiguring = phase === "idle"
  const isDone = phase === "done"
  const isWork = phase === "work"

  if (isConfiguring) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 py-2">
        <div className="grid grid-cols-3 gap-3">
          <NumberScrollField
            id="sw-sets"
            label={t("home.stopwatchWidget.interval.setsLabel")}
            min={1}
            value={sets}
            onChange={setSets}
          />
          <NumberScrollField
            id="sw-work"
            label={t("home.stopwatchWidget.interval.durationLabel")}
            min={1}
            step={5}
            suffix="s"
            value={workSeconds}
            onChange={setWorkSeconds}
          />
          <NumberScrollField
            id="sw-rest"
            label={t("home.stopwatchWidget.interval.restLabel")}
            min={0}
            step={5}
            suffix="s"
            value={restSeconds}
            onChange={setRestSeconds}
          />
        </div>
        <p className="text-muted-foreground text-center text-xs">{t("home.stopwatchWidget.interval.dragHint")}</p>
        <Button type="button" size="sm" className="self-center" onClick={handleStart}>
          <Play />
          {t("home.stopwatchWidget.interval.start")}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-2">
      {isDone ? (
        <p className="text-lg font-semibold">{t("home.stopwatchWidget.interval.done", { sets })}</p>
      ) : (
        <>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              isWork
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            )}
          >
            {isWork
              ? t("home.stopwatchWidget.interval.phaseWork")
              : t("home.stopwatchWidget.interval.phasePause")}{" "}
            —{" "}
            {t("home.stopwatchWidget.interval.setProgress", { current: currentSet, total: sets })}
          </span>
          <div className="font-mono text-4xl font-semibold tabular-nums">
            {formatCountdown(remainingMs)}
          </div>
        </>
      )}
      <div className="flex items-center gap-2">
        {isDone ? (
          <Button type="button" size="sm" onClick={handleReset}>
            <RotateCcw />
            {t("home.stopwatchWidget.interval.newSet")}
          </Button>
        ) : (
          <>
            <Button type="button" size="sm" onClick={isRunning ? handlePause : handleStart}>
              {isRunning ? <Pause /> : <Play />}
              {isRunning
                ? t("home.stopwatchWidget.interval.pause")
                : t("home.stopwatchWidget.interval.resume")}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleSkip}>
              <SkipForward />
              {t("home.stopwatchWidget.interval.skip")}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw />
              {t("home.stopwatchWidget.interval.reset")}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export function HomeStopwatchWidget() {
  const { t } = useTranslation()

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Timer className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-medium">{t("home.stopwatchWidget.title")}</p>
            <p className="truncate text-xs text-muted-foreground">{t("home.stopwatchWidget.subtitle")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <Tabs defaultValue="stopwatch" className="flex flex-1 flex-col">
          <TabsList className="self-center">
            <TabsTrigger value="stopwatch">{t("home.stopwatchWidget.tabs.stopwatch")}</TabsTrigger>
            <TabsTrigger value="intervals">{t("home.stopwatchWidget.tabs.intervals")}</TabsTrigger>
          </TabsList>
          <TabsContent value="stopwatch" className="flex flex-1 flex-col">
            <StopwatchTab />
          </TabsContent>
          <TabsContent value="intervals" className="flex flex-1 flex-col">
            <IntervalTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
