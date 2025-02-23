export function formatCurrency({ valueInCents }: { valueInCents: number }) {
  return (valueInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
