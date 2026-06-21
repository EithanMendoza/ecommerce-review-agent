# 🤖🛒 Ecommerce Review Agent (Frontend)

Interfaz de usuario B2B diseñada para interactuar con un sistema **RAG (Retrieval-Augmented Generation) Local**. Este panel permite a los analistas consultar grandes volúmenes de reseñas de productos de e-commerce mediante un agente conversacional, visualizando métricas y gestionando el historial de análisis de forma segura y privada.

## ✨ Características Principales

* **Autenticación Segura:** Sistema de login mediante JWT (JSON Web Tokens) con manejo de sesiones y cierres automáticos por caducidad (Interceptor 401).
* **Chat en Tiempo Real (Streaming):** Consumo de Server-Sent Events (SSE) para renderizar respuestas del modelo Llama/Mistral de forma progresiva (efecto máquina de escribir).
* **Reconocimiento de Voz Nativo:** Integración de la *Web Speech API* para dictado fluido directo en el navegador, reduciendo el consumo de RAM en el servidor.
* **Historial Persistente:** Navegación por conversaciones anteriores utilizando React Router con parámetros dinámicos.
* **Panel de Administración:** Desplegable de herramientas para extraer métricas, exportar CSVs, limpiar la base de datos vectorial y ver diagnósticos del sistema.

## 🛠️ Stack Tecnológico

* **Core:** React 18 + TypeScript + Vite.
* **Estilos:** Tailwind CSS.
* **Enrutamiento:** React Router v6 (Rutas protegidas y layouts anidados).
* **Iconografía:** Lucide React.
* **Arquitectura:** Patrón de Componentes Inteligentes/Tontos (Smart/Dumb) y separación estricta de lógica de red mediante servicios.

## 📂 Arquitectura del Proyecto (Para Desarrolladores)

El proyecto está diseñado respetando el Principio de Responsabilidad Única (SOLID) para que sea altamente escalable.

```text
src/
├── componentes/      # UI Estúpida (Dumb Components). Solo reciben props y renderizan.
│   ├── chat/         # Burbujas, área de escritura y menú de herramientas.
│   ├── envolturas/   # Layouts estáticos (Sidebar) y Guardias de rutas (RutaProtegida).
│   └── ui/           # Componentes genéricos como modales y botones.
├── contextos/        # Estado global de la aplicación (ContextoAuth).
├── hooks/            # Lógica de negocio (Smart Hooks). Control de estado, voz y streams.
├── servicios/        # Capa de red exclusiva. Únicos archivos que ejecutan fetch().
├── tipos/            # Contratos de TypeScript (Interfaces) para blindar la app.
└── vistas/           # Orquestadores de pantalla (Smart Components) que unen hooks y UI.
```

## 🚀 Instalación y Despliegue Local

### Requisitos Previos
* **Node.js:** v18 o superior recomendado.
* **Backend:** El Backend (API de FastAPI) debe estar corriendo en `http://localhost:8000` para que el sistema funcione.

### Pasos

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/EithanMendoza/ecommerce-review-agent.git](https://github.com/EithanMendoza/ecommerce-review-agent.git)
   ```

2. Entra al directorio del proyecto:
   ```bash
   cd ecommerce-review-agent
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```

4. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🔐 Notas sobre Seguridad

Este frontend maneja credenciales bajo el enfoque **Stateless**. El token de sesión (`token_rag`) se almacena localmente y es inyectado automáticamente en los cabezales de autorización (`Bearer`) en cada petición a través de la capa `servicios/`.