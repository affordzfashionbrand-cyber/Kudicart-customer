/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        black: "#111111",
        ink: "#111111",
        paper: "#F7F7F5",
        softWhite: "#F7F7F5",
        white: "#ffffff",
        line: "#D9D9D5",
        concrete: "#D9D9D5",
        graphite: "#353335",
        muted: "#6B6667",
        grey: "#6B6667",
        signal: "#FF5A1F",
        orange: "#FF5A1F",
        coral: "#FF5A1F",
        oyster: "#F4F1EA",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "PlusJakartaSans_400Regular", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "PlusJakartaSans_700Bold", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "PlayfairDisplay_600SemiBold", "Georgia", "serif"],
        editorial: ["Playfair Display", "PlayfairDisplay_600SemiBold", "Georgia", "serif"],
        'display-hero': ["Playfair Display", "PlayfairDisplay_600SemiBold", "Georgia", "serif"],
        'headline-lg': ["Playfair Display", "PlayfairDisplay_600SemiBold", "Georgia", "serif"],
        'headline-md': ["Playfair Display", "PlayfairDisplay_500Medium", "Georgia", "serif"],
        'headline-sm': ["Playfair Display", "PlayfairDisplay_500Medium", "Georgia", "serif"],
        'body-lg': ["Plus Jakarta Sans", "PlusJakartaSans_400Regular", "sans-serif"],
        'body-md': ["Plus Jakarta Sans", "PlusJakartaSans_400Regular", "sans-serif"],
        'body-sm': ["Plus Jakarta Sans", "PlusJakartaSans_400Regular", "sans-serif"],
        'label-editorial': ["Plus Jakarta Sans", "PlusJakartaSans_600SemiBold", "sans-serif"],
        'label-sm': ["Plus Jakarta Sans", "PlusJakartaSans_600SemiBold", "sans-serif"],
      },
    }
  }
};