import { useState } from "react"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { GoogleLogin } from "@react-oauth/google"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { loginRequest, googleAuthRequest } from "@/api/auth"

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const data = await loginRequest(email, password)
      login(data)
      navigate("/")
    } catch (error) {
      toast.error(error.response?.data?.message || t("auth.login.errors.loginFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    try {
      const data = await googleAuthRequest(credentialResponse.credential)
      if (data.isNewUser) {
        navigate("/complete-profile", { state: data })
        return
      }
      login(data)
      navigate("/")
    } catch (error) {
      toast.error(error.response?.data?.message || t("auth.login.errors.googleLoginFailed"))
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("auth.login.title")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("auth.login.subtitle")}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">{t("auth.login.emailLabel")}</FieldLabel>
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
          <div className="flex items-center">
            <FieldLabel htmlFor="password">{t("auth.login.passwordLabel")}</FieldLabel>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {t("auth.login.forgotPassword")}
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </Field>
        <FieldSeparator>{t("auth.login.orContinueWith")}</FieldSeparator>
        <Field>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error(t("auth.login.errors.googleLoginFailed"))}
            />
          </div>
          <FieldDescription className="text-center">
            {t("auth.login.noAccount")}{" "}
            <a href="/register" className="underline underline-offset-4">
              {t("auth.login.signUp")}
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
