/** @type {import('tailwindcss').Config} */
export default {
  // ESTA SECCIÓN ES LA MÁS IMPORTANTE
  content: [
    "./index.html", // Revisa el HTML en la raíz
    "./src/**/*.{js,ts,jsx,tsx}", // ¡Esta es la línea CRÍTICA!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}