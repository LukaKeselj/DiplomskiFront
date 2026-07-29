import { useState } from "react"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"

import { createSupplementRequest, updateSupplementRequest } from "@/api/supplements"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SupplementForm({ supplement }) {
  const isEditing = Boolean(supplement)
  const navigate = useNavigate()
  const [name, setName] = useState(supplement?.name ?? "")
  const [imageUrl, setImageUrl] = useState(supplement?.imageUrl ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      toast.error("Naziv suplementa je obavezan")
      return
    }

    const payload = { name: name.trim(), imageUrl }

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await updateSupplementRequest(supplement._id, payload)
        toast.success("Suplement je ažuriran")
      } else {
        await createSupplementRequest(payload)
        toast.success("Suplement je kreiran")
      }
      navigate("/supplements")
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("Suplement sa tim nazivom već postoji")
      } else {
        toast.error(error.response?.data?.message || "Čuvanje suplementa nije uspelo")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-16">
            <AvatarImage src={imageUrl} alt={name} className="object-contain" />
            <AvatarFallback className="text-base">
              {name.trim().slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Field className="flex-1">
            <FieldLabel htmlFor="supplement-image-url">Link do slike</FieldLabel>
            <Input
              id="supplement-image-url"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
            <FieldDescription>Nalepi link do slike sa neta. Opciono.</FieldDescription>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="supplement-name">Naziv suplementa</FieldLabel>
          <Input
            id="supplement-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Čuvanje..." : isEditing ? "Sačuvaj izmene" : "Kreiraj suplement"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Otkaži
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
