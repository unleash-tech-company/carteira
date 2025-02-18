"use client"

import { ptBR, type Locale } from "@/lib/i18n/pt-BR"
import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "@carteira/language"
const DEFAULT_LANGUAGE = "pt-BR"

type LanguageCode = "pt-BR" // Add more languages here in the future

const SUPPORTED_LANGUAGES: LanguageCode[] = ["pt-BR"] // Add more languages here in the future

const LOCALES: Record<LanguageCode, Locale> = {
  "pt-BR": ptBR,
  // Add more locales here in the future
}

function getBrowserLanguage(): LanguageCode {
  // Only runs in the browser
  if (typeof window === "undefined") return DEFAULT_LANGUAGE as LanguageCode

  // Get browser languages
  const browserLanguages = window.navigator.languages || [window.navigator.language]

  // Find first supported language
  const supportedLanguage = browserLanguages.find((lang) =>
    SUPPORTED_LANGUAGES.includes(lang as LanguageCode)
  )

  return (supportedLanguage || DEFAULT_LANGUAGE) as LanguageCode
}

function getStoredLanguage(): LanguageCode | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEY) as LanguageCode | null
}

function storeLanguage(language: LanguageCode) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, language)
}

export function useI18n() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE)

  // Initialize language on mount
  useEffect(() => {
    const stored = getStoredLanguage()
    const initial = stored || getBrowserLanguage()
    setCurrentLanguage(initial)
  }, [])

  // Change language
  const changeLanguage = useCallback((language: LanguageCode) => {
    if (!SUPPORTED_LANGUAGES.includes(language)) return
    setCurrentLanguage(language)
    storeLanguage(language)
  }, [])

  return {
    locale: LOCALES[currentLanguage],
    currentLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }
} 