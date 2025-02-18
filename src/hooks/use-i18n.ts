import { ptBR, type Locale } from "@/lib/i18n/pt-BR"

// This can be expanded later to support multiple languages and language switching
export function useI18n() {
  // For now, we'll just return ptBR
  // In the future, this could be connected to a language context/store
  const locale: Locale = ptBR

  return {
    locale,
    // Add language switching functionality here in the future
  }
} 