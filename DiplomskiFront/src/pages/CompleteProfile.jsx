import { useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { completeGoogleRegistrationRequest } from "@/api/auth"

export default function CompleteProfile() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [height, setHeight] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const profile = location.state

  if (!profile?.pendingToken) {
    return <Navigate to="/login" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const data = await completeGoogleRegistrationRequest(profile.pendingToken, {
        username,
        height: Number(height),
      })
      login(data)
      navigate("/")
    } catch (error) {
      toast.error(error.response?.data?.message || t("profile.errors.failed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.title")}</CardTitle>
            <CardDescription>
              {t("profile.description", { email: profile.email })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">{t("profile.usernameLabel")}</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="height">{t("profile.heightLabel")}</FieldLabel>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t("profile.submitting") : t("profile.submit")}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
