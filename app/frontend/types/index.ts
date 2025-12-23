export type Flash = {
  notice?: string
  alert?: string
}

export type AuthUser = {
  id: number
  email: string
  first_name: string
  last_name: string
}

export type SharedProps = {
  flash: Flash
  auth?: AuthUser | null
}

export type PageProps<T = Record<string, unknown>> = SharedProps & T
