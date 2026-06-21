const getRuntimeEnv = (names: string[]): string | undefined => {
  for (const name of names) {
    const value = process.env[name]
    if (value !== undefined && value !== '') return value
  }

  return undefined
}

export const runtimeString = (value: unknown, envNames: string[], fallback = ''): string => {
  return getRuntimeEnv(envNames) ?? (typeof value === 'string' && value ? value : fallback)
}

export const runtimeBoolean = (value: unknown, envNames: string[], fallback = false): boolean => {
  const env = getRuntimeEnv(envNames)
  if (env !== undefined) return env === 'true'
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return fallback
}

export const runtimeNumber = (value: unknown, envNames: string[], fallback: number): number => {
  const raw = getRuntimeEnv(envNames) ?? value
  const numberValue = Number(raw)

  return Number.isFinite(numberValue) ? numberValue : fallback
}
