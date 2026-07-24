import { useState } from "react"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
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
import { registerRequest, googleAuthRequest } from "@/api/auth"

const initialForm = {
  name: "",
  surname: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  height: "",
}

export function SignupForm({ className, ...props }) {
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error("Lozinke se ne poklapaju")
      return
    }

    setIsSubmitting(true)
    try {
      await registerRequest({
        name: form.name,
        surname: form.surname,
        username: form.username,
        email: form.email,
        password: form.password,
        height: Number(form.height),
      })
      toast.success("Nalog je kreiran! Proveri email da potvrdiš nalog.")
      navigate("/login")
    } catch (error) {
      toast.error(error.response?.data?.message || "Registracija nije uspela")
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
      toast.error(error.response?.data?.message || "Google sign up failed")
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="name">First Name</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="John"
              value={form.name}
              onChange={handleChange("name")}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="surname">Last Name</FieldLabel>
            <Input
              id="surname"
              type="text"
              placeholder="Doe"
              value={form.surname}
              onChange={handleChange("surname")}
              required
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            value={form.username}
            onChange={handleChange("username")}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={form.email}
            onChange={handleChange("email")}
            required
          />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="height">Height (cm)</FieldLabel>
          <Input
            id="height"
            type="number"
            placeholder="180"
            value={form.height}
            onChange={handleChange("height")}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            required
          />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            required
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign up failed")}
            />
          </div>
          <FieldDescription className="px-6 text-center">
            Already have an account? <a href="/login">Sign in</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
