/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: "#F5E6D3",
          beige: "#E6CCB2",
          brown: "#B08968",
          coffee: "#7F5539",
          dark: "#3C2A20",
        },
        accent: {
          green: "#38491E",
          red: "#BC4749",
        },
      },
      fontFamily: {
        sans: ["Omnes", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
