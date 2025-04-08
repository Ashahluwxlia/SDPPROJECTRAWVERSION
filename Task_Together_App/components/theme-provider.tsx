"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

interface ExtendedThemeProviderProps extends ThemeProviderProps {
  isDemoMode?: boolean
}

export function ThemeProvider({ children, isDemoMode, ...props }: ExtendedThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <div className={isDemoMode ? "border border-dashed border-muted-foreground/30 rounded-md" : ""}>
        {children}
      </div>
    </NextThemesProvider>
  )
}

