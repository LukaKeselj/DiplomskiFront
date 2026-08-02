import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { resetPasswordRequest } from "@/api/auth"

export function ResetPasswordForm({ className, ...props }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  const { t } = useTranslation()

  async function handleSubmit(event) {
    event.preventDefault()

    if (!token) {
      toast.error(t("auth.resetPassword.errors.invalidLink"))
      return
    }

    if (password !== confirmPassword) {
      toast.error(t("auth.resetPassword.errors.mismatch"))
      return
    }

    setIsSubmitting(true)
    try {
      await resetPasswordRequest(token, password)
      toast.success(t("auth.resetPassword.success"))
      navigate("/login")
    } catch (error) {
      toast.error(error.response?.data?.message || t("auth.resetPassword.errors.generic"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("auth.resetPassword.title")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("auth.resetPassword.subtitle")}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="password">{t("auth.resetPassword.newPasswordLabel")}</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">
            {t("auth.resetPassword.confirmPasswordLabel")}
          </FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
          </Button>
        </Field>
        <FieldDescription className="text-center">
          <a href="/login" className="underline underline-offset-4">
            {t("auth.resetPassword.backToLogin")}
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
