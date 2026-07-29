// Matches JS Date#getDay(): 0 = nedelja ... 6 = subota
export const DAYS_OF_WEEK = [
  { value: 0, label: "Nedelja" },
  { value: 1, label: "Ponedeljak" },
  { value: 2, label: "Utorak" },
  { value: 3, label: "Sreda" },
  { value: 4, label: "Četvrtak" },
  { value: 5, label: "Petak" },
  { value: 6, label: "Subota" },
]

// Display order Monday -> Sunday, independent of the underlying dayOfWeek value.
export const DAYS_OF_WEEK_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
