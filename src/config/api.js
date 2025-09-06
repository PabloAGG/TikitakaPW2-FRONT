
const API_URL = import.meta.env.VITE_API_URL;

// 2. Si la variable no está definida, lanza un error para evitar problemas en producción
if (!API_URL) {
  throw new Error("La variable de entorno VITE_API_URL no está definida. Revisa tu archivo .env");
}

export default API_URL;