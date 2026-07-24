import { useState } from "react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { forgotPasswordRequest } from "@/api/auth"

export function ForgotPasswordForm({ className, ...props }) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await forgotPasswordRequest(email)
      setIsSent(true)
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-sm text-balance text-muted-foreground">
            If an account exists for {email}, we&apos;ve sent a link to reset your password.
          </p>
        </div>
        <FieldDescription className="text-center">
          <a href="/login" className="underline underline-offset-4">
            Back to login
          </a>
        </FieldDescription>
      </div>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email and we&apos;ll send you a link to reset it
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
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
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Remember your password?{" "}
          <a href="/login" className="underline underline-offset-4">
            Login
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
