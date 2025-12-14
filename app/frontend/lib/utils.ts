import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export type I18nNode = {
  [key: string]: I18nNode | string
}
export function i18n_t(i18n: I18nNode, path: string, fallback: string = path) {
  const keys = path.split(".")
  let current: I18nNode | string = i18n
  for (const key of keys) {
    if (!current || typeof current !== "object") {
      return fallback
    }
    current = current[key]
  }

  return current ?? fallback
}
