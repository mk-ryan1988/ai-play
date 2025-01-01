import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        dark: {
          primary: colors.neutral[950],
          secondary: colors.neutral[900],
          tertiary: colors.neutral[800],
        },
        light: {
          primary: colors.white,
          secondary: colors.neutral[50],
          tertiary: colors.neutral[100],
        },
        text: {
          dark: colors.white,
          light: colors.black,
        }
      },
    },
  },
  plugins: [],
}

export default config
