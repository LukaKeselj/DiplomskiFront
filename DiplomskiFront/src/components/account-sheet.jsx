import { useRef, useState } from "react"
import toast from "react-hot-toast"

import { updateUserRequest } from "@/api/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useAuth } from "@/context/AuthContext"
import { getInitials } from "@/lib/utils"

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const emptyPasswordFields = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
}

export function AccountSheet({ open, onOpenChange }) {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)
  const [wasOpen, setWasOpen] = useState(false)
  const [form, setForm] = useState(null)
  const [profileImage, setProfileImage] = useState("")
  const [passwordFields, setPasswordFields] = useState(emptyPasswordFields)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open && user) {
      setForm({
        name: user.name ?? "",
        surname: user.surname ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        height: user.height ?? "",
      })
      setProfileImage(user.profileImage ?? "")
      setPasswordFields(emptyPasswordFields)
    }
  }

  if (!form) return null

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handlePasswordChange(field) {
    return (event) => setPasswordFields((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleImageSelect(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Slika je prevelika (maksimalno 2MB)")
      return
    }

    const reader = new FileReader()
    reader.onload = () => setProfileImage(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const { currentPassword, newPassword, confirmNewPassword } = passwordFields
    const isChangingPassword = currentPassword || newPassword || confirmNewPassword

    if (isChangingPassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        toast.error("Popuni sva polja za promenu šifre")
        return
      }
      if (newPassword.length < 8) {
        toast.error("Nova šifra mora imati bar 8 karaktera")
        return
      }
      if (newPassword !== confirmNewPassword) {
        toast.error("Nove šifre se ne poklapaju")
        return
      }
    }

    const payload = {
      name: form.name,
      surname: form.surname,
      username: form.username,
      email: form.email,
      height: Number(form.height),
      profileImage,
    }

    if (isChangingPassword) {
      payload.password = newPassword
      payload.currentPassword = currentPassword
    }

    setIsSubmitting(true)
    try {
      const updatedUser = await updateUserRequest(user._id, payload)
      updateUser(updatedUser)
      setPasswordFields(emptyPasswordFields)
      toast.success("Nalog je ažuriran")
    } catch (error) {
      toast.error(error.response?.data?.message || "Ažuriranje naloga nije uspelo")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nalog</SheetTitle>
          <SheetDescription>Ažuriraj svoje podatke, sliku i šifru.</SheetDescription>
        </SheetHeader>
        <form className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-16">
                <AvatarImage src={profileImage} alt={form.name} />
                <AvatarFallback className="text-base">
                  {getInitials(form.name, form.surname)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Promeni sliku
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <FieldDescription>JPG ili PNG, maksimalno 2MB.</FieldDescription>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="account-name">Ime</FieldLabel>
                <Input id="account-name" value={form.name} onChange={handleChange("name")} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="account-surname">Prezime</FieldLabel>
                <Input
                  id="account-surname"
                  value={form.surname}
                  onChange={handleChange("surname")}
                  required
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="account-username">Korisničko ime</FieldLabel>
              <Input
                id="account-username"
                value={form.username}
                onChange={handleChange("username")}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="account-email">Email</FieldLabel>
              <Input
                id="account-email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="account-height">Visina (cm)</FieldLabel>
              <Input
                id="account-height"
                type="number"
                value={form.height}
                onChange={handleChange("height")}
                required
              />
            </Field>

            <FieldSeparator>Promena šifre</FieldSeparator>

            <Field>
              <FieldLabel htmlFor="current-password">Trenutna šifra</FieldLabel>
              <Input
                id="current-password"
                type="password"
                value={passwordFields.currentPassword}
                onChange={handlePasswordChange("currentPassword")}
                autoComplete="current-password"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="new-password">Nova šifra</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordFields.newPassword}
                  onChange={handlePasswordChange("newPassword")}
                  autoComplete="new-password"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-new-password">Potvrdi šifru</FieldLabel>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={passwordFields.confirmNewPassword}
                  onChange={handlePasswordChange("confirmNewPassword")}
                  autoComplete="new-password"
                />
              </Field>
            </div>
            <FieldDescription>Ostavi prazno ako ne želiš da menjaš šifru.</FieldDescription>
          </FieldGroup>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Čuvanje..." : "Sačuvaj izmene"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
