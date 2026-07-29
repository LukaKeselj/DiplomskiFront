import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getInitials(name, surname) {
  return `${name?.[0] ?? ""}${surname?.[0] ?? ""}`.toUpperCase() || "?"
}

export function formatFullDateLabel(date) {
  const label = date.toLocaleDateString("sr-Latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}
