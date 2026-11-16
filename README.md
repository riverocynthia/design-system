# Design system · Cynthia Rivero

Design system personal: tokens en tres capas, componentes con prefijo `cr-` y un sitio de documentación con paleta, tipografía, espaciado, contraste WCAG medido en vivo y ejemplos de cada componente.

## Estructura

```
src/
  tokens/
    primitives.css   # Capa 1: valores crudos (paletas de 11 tonos, espaciado, radios, tipografía)
    semantic.css     # Capa 2: uso (color-brand, color-text-body…) con modo claro y oscuro
    components.css   # Capa 3: tokens por componente (button-radius, card-padding…)
    index.css        # importa las tres capas
  css/
    base.css         # reset mínimo
    components.css   # clases cr-btn, cr-card, cr-tag…
  docs/              # sitio de documentación (React + Vite)
```

## Usar en otro proyecto

```css
@import './tokens/index.css';
@import './css/components.css';
```

```html
<html data-theme="light"> <!-- o "dark" -->
```

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

## Decisiones de accesibilidad

- Todo texto cumple WCAG 2.2 AA (4.5:1); los componentes de interfaz, 3:1. La página de documentación recalcula los ratios en vivo al cambiar de modo.
- `orange-500` sobre blanco no llega a 4.5:1, por eso el botón de acento lleva texto oscuro (`color-on-accent-solid`) y el naranja como texto sobre fondo claro usa `orange-700`.
- Estado de foco visible en todos los elementos interactivos y respeto de `prefers-reduced-motion`.
