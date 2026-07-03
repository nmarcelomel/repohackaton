# Diseño Técnico

## Estructura
```
src/
├── app/App.tsx # Router principal
├── layouts/ # MainLayout, Sidebar, Topbar
├── pages/ # Páginas por módulo
│ ├── bienestar/
│ ├── talento/
│ ├── flujo/
│ └── negocio/
├── data/ # mock-data.json + data-service.ts
├── types/ # Interfaces TypeScript
└── shared/ # Componentes reutilizables
```

## Paleta
- Verde: #00A651 | Amarillo: #FFC107 | Gris BG: #F5F5F5 | Texto: #333333

## Dependencias
| Paquete | Versión |
|---------|---------|
| react | 18.3.1 |
| react-router-dom | 6.23.1 |
| lucide-react | 0.378.0 |
| tailwindcss | 3.4.4 |
| vite | 5.3.1 |
| typescript | 5.4.5 |
