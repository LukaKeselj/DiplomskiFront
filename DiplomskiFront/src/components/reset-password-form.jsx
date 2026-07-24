import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import toast from "react-hot-toast"
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

  async function handleSubmit(event) {
    event.preventDefault()

    if (!token) {
      toast.error("Reset link is invalid or has expired")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      await resetPasswordRequest(token, password)
      toast.success("Password reset successfully")
      navigate("/login")
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter a new password for your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
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
            {isSubmitting ? "Resetting..." : "Reset password"}
          </Button>
        </Field>
        <FieldDescription className="text-center">
          <a href="/login" className="underline underline-offset-4">
            Back to login
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
