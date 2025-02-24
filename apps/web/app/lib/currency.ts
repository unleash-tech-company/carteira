export function formatCurrency({ valueInCents }: { valueInCents: number }) {
  return (valueInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function parseCurrency(value?: string | number) {
  if (typeof value === "number") return value
  if (!value) return value
  const parsed = value.replace?.(/[^\d]/g, "")
  return Number(parsed.replace(",", "."))
}
