import { Dumbbell } from "lucide-react"

import { ResetPasswordForm } from "@/components/reset-password-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ResetPassword() {
  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <ThemeToggle className="absolute top-4 right-4 z-10" />
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Dumbbell className="size-4" />
            </div>
            IronLog
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/images/teretana.jpeg"
          alt="Teretana"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
