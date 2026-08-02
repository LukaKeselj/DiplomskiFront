import { useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { forgotPasswordRequest } from "@/api/auth"

export function ForgotPasswordForm({ className, ...props }) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const { t } = useTranslation()

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await forgotPasswordRequest(email)
      setIsSent(true)
    } catch (error) {
      toast.error(error.response?.data?.message || t("auth.forgotPassword.errors.generic"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("auth.forgotPassword.sentTitle")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("auth.forgotPassword.sentDescription", { email })}
          </p>
        </div>
        <FieldDescription className="text-center">
          <a href="/login" className="underline underline-offset-4">
            {t("auth.forgotPassword.backToLogin")}
          </a>
        </FieldDescription>
      </div>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("auth.forgotPassword.title")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("auth.forgotPassword.subtitle")}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">{t("auth.forgotPassword.emailLabel")}</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
          </Button>
        </Field>
        <FieldDescription className="text-center">
          {t("auth.forgotPassword.rememberPassword")}{" "}
          <a href="/login" className="underline underline-offset-4">
            {t("auth.forgotPassword.login")}
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
