# TikitakaPW2-FRONT
Este repositorio contiene el código fuente del frontend para la aplicación de e-commerce "Tikitaka". Esta es la parte cliente de la aplicación, responsable de la interfaz de usuario con la que los clientes interactúan.<br>

📜 Descripción<br>
El frontend de Tikitaka es una aplicación de una sola página (SPA) desarrollada con React y construida con Vite para ofrecer una experiencia de usuario rápida y moderna. Se conecta con la API del Tikitaka-Backend para mostrar productos, gestionar el carrito de compras y procesar la autenticación de usuarios.<br>
👥 Integrantes<br>
Pablo Angel Garcia Garza - PabloAGG<br>

Jorge Gael Rodriguez Ibarra<br>

🚀 Tecnologías Utilizadas<br>
React: Biblioteca de JavaScript para construir interfaces de usuario.<br>

Vite: Herramienta de construcción y servidor de desarrollo rápido.<br>
📁 Estructura del Proyecto<br>
TikitakaPW2-FRONT/<br>
├── public/              # Activos estáticos públicos.<br>
├── src/                 # Código fuente principal de la aplicación.<br>
│   ├── assets/          # Imágenes, logos, y otros recursos.<br>
│   ├── componentes/     # Componentes reutilizables (Button, Card, Input).<br>
│   ├── config/          # Configuración de clientes API .<br>
│   ├── pages/           # Componentes que representan páginas completas (Login, Home).<br>
│   ├── App.css          # Estilos globales de la aplicación.<br>
│   ├── App.jsx          # Componente raíz que maneja el enrutamiento.<br>
│   ├── index.css        # Estilos base .<br>
│   └── main.jsx         # Punto de entrada de la aplicación.<br>
├── .gitignore           # Archivos ignorados por Git.<br>
├── index.html           # Plantilla HTML principal.<br>
├── package.json         # Dependencias y scripts del proyecto.<br>
├── tailwind.config.js   # Archivo de configuración de Tailwind CSS.<br>
└── vite.config.js       # Archivo de configuración de Vite.<br>
src: Contiene todo el código fuente de React.<br>

pages: Son los componentes de nivel superior que actúan como las "vistas" o "pantallas" de la aplicación (por ejemplo, la página de inicio, la de registro, etc.).<br>

componentes: Piezas de UI más pequeñas y reutilizables que se usan dentro de las páginas (como un botón).
<br>
assets: Almacena imágenes, SVGs y otros recursos que son importados directamente por los componentes.<br>

main.jsx: Es el archivo que inicia la aplicación, renderizando el componente principal (App.jsx) en el index.html.<br>

public: Contiene archivos estáticos que no se procesan durante la compilación, como el ícono de la pestaña del navegador.<br>
