import { useState } from 'react'
import { resolveRgb, toHex, contrast, grade } from './contrast.js'

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
const SCALES = [
  { name: 'blue', label: 'Azul', steps: STEPS },
  { name: 'cyan', label: 'Celeste', steps: STEPS },
  { name: 'orange', label: 'Naranja', steps: STEPS },
  { name: 'gray', label: 'Gris', steps: STEPS },
]

const SEMANTIC = [
  ['Fondos', ['color-bg-page', 'color-bg-subtle', 'color-bg-inverse', 'color-surface', 'color-surface-muted']],
  ['Texto', ['color-text-primary', 'color-text-body', 'color-text-muted', 'color-text-inverse', 'color-text-inverse-muted']],
  ['Marca y acento', ['color-brand', 'color-brand-hover', 'color-brand-subtle', 'color-accent-solid', 'color-accent-text']],
  ['Bordes y foco', ['color-border', 'color-border-strong', 'color-focus-ring']],
  ['Estado', ['color-success-text', 'color-danger-text', 'color-warning-text']],
]

const PAIRS = [
  ['Texto principal sobre página', 'color-text-primary', 'color-bg-page', false],
  ['Texto cuerpo sobre página', 'color-text-body', 'color-bg-page', false],
  ['Texto cuerpo sobre superficie', 'color-text-body', 'color-surface', false],
  ['Texto secundario sobre página', 'color-text-muted', 'color-bg-page', false],
  ['Texto secundario sobre gris suave', 'color-text-muted', 'color-surface-muted', false],
  ['Marca sobre página', 'color-brand', 'color-bg-page', false],
  ['Acento (texto) sobre página', 'color-accent-text', 'color-bg-page', false],
  ['Texto sobre botón de marca', 'color-on-brand', 'color-brand', false],
  ['Texto sobre botón de acento', 'color-on-accent-solid', 'color-accent-solid', false],
  ['Texto inverso sobre fondo inverso', 'color-text-inverse', 'color-bg-inverse', false],
  ['Celeste suave sobre fondo inverso', 'color-text-inverse-muted', 'color-bg-inverse', false],
  ['Anillo de foco sobre página (UI, 3:1)', 'color-focus-ring', 'color-bg-page', true],
]

const TYPE_SCALE = [
  ['5xl', 'Display', 'font-size-5xl', 'extrabold', 'tight'],
  ['4xl', 'Título de página', 'font-size-4xl', 'extrabold', 'tight'],
  ['3xl', 'Título de sección', 'font-size-3xl', 'bold', 'snug'],
  ['2xl', 'Subtítulo', 'font-size-2xl', 'bold', 'snug'],
  ['xl', 'Título de card', 'font-size-xl', 'semibold', 'snug'],
  ['lg', 'Texto destacado', 'font-size-lg', 'regular', 'normal'],
  ['md', 'Texto de párrafo, base del sistema', 'font-size-md', 'regular', 'normal'],
  ['sm', 'Texto secundario y etiquetas', 'font-size-sm', 'regular', 'normal'],
  ['xs', 'Eyebrow y metadatos', 'font-size-xs', 'semibold', 'normal'],
]

const SPACING = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20']
const RADII = ['sm', 'md', 'lg', 'xl', 'pill']
const SHADOWS = ['sm', 'md', 'lg']

const NAV = [
  ['overview', 'Principios'],
  ['colors', 'Color'],
  ['accessibility', 'Contraste'],
  ['typography', 'Tipografía'],
  ['spacing', 'Espacio y forma'],
  ['components', 'Componentes'],
]

function Section({ id, title, intro, children }) {
  return (
    <section id={id} className="docs-section">
      <h2 className="cr-section-title">{title}</h2>
      {intro && <p className="cr-section-subtitle docs-intro">{intro}</p>}
      {children}
    </section>
  )
}

function Code({ children }) {
  return <pre className="docs-code" tabIndex={0}><code>{children}</code></pre>
}

function Swatch({ token, label }) {
  const rgb = resolveRgb(`var(--${token})`)
  const white = contrast(rgb, [255, 255, 255])
  const dark = contrast(rgb, resolveRgb('var(--blue-950)'))
  const onWhite = white >= dark
  return (
    <div className="docs-swatch">
      <div className="docs-swatch-chip" style={{ background: `var(--${token})` }}>
        <span style={{ color: onWhite ? '#fff' : 'var(--blue-950)' }}>
          {(onWhite ? white : dark).toFixed(1)}:1
        </span>
      </div>
      <code className="docs-swatch-name">{label ?? token}</code>
      <span className="docs-swatch-hex">{toHex(rgb)}</span>
    </div>
  )
}

function Colors() {
  return (
    <Section
      id="colors"
      title="Color"
      intro="Tres tonos de marca (azul, celeste y naranja) más gris neutro, cada uno en 11 escalones. El número dentro de cada chip es el mejor contraste posible contra blanco u oscuro."
    >
      {SCALES.map((s) => (
        <div key={s.name} className="docs-block">
          <h3 className="docs-h3">{s.label}</h3>
          <div className="docs-scale">
            {s.steps.map((step) => (
              <Swatch key={step} token={`${s.name}-${step}`} label={step} />
            ))}
          </div>
        </div>
      ))}

      <h3 className="docs-h3 docs-h3--lg">Tokens semánticos</h3>
      <p className="docs-note">
        Describen el uso, no el valor. Cambiá el modo arriba a la derecha: los nombres no cambian, los valores sí.
      </p>
      {SEMANTIC.map(([group, tokens]) => (
        <div key={group} className="docs-block">
          <h4 className="docs-h4">{group}</h4>
          <div className="docs-scale docs-scale--wide">
            {tokens.map((t) => <Swatch key={t} token={t} />)}
          </div>
        </div>
      ))}
    </Section>
  )
}

function Accessibility() {
  return (
    <Section
      id="accessibility"
      title="Contraste y accesibilidad"
      intro="Cada par de colores de uso real se mide en vivo contra WCAG 2.2: 4.5:1 para texto normal, 3:1 para componentes de interfaz. Se recalcula al cambiar de modo."
    >
      <div className="docs-table-wrap">
        <table className="docs-table">
          <caption className="docs-sr-only">Ratios de contraste de los pares de colores del sistema</caption>
          <thead>
            <tr><th scope="col">Par</th><th scope="col">Muestra</th><th scope="col">Ratio</th><th scope="col">Resultado</th></tr>
          </thead>
          <tbody>
            {PAIRS.map(([label, fg, bg, ui]) => {
              const ratio = contrast(resolveRgb(`var(--${fg})`), resolveRgb(`var(--${bg})`))
              const pass = ui ? ratio >= 3 : ratio >= 4.5
              return (
                <tr key={label}>
                  <td>
                    {label}
                    <br />
                    <code>{fg}</code> / <code>{bg}</code>
                  </td>
                  <td>
                    <span className="docs-sample" style={{ color: `var(--${fg})`, background: `var(--${bg})` }}>
                      Aa
                    </span>
                  </td>
                  <td>{ratio.toFixed(2)}:1</td>
                  <td>
                    <span className={`cr-tag ${pass ? 'cr-tag--success' : 'cr-tag--danger'}`}>
                      {ui ? (pass ? 'AA (UI)' : 'No pasa') : grade(ratio)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="docs-note">
        Decisión de diseño: el naranja <code>orange-500</code> sobre blanco no llega a 4.5:1, por eso se usa solo como relleno con texto
        oscuro encima (<code>color-on-accent-solid</code>). Cuando el naranja es texto sobre fondo claro se usa <code>orange-700</code>.
      </p>
    </Section>
  )
}

function Typography() {
  return (
    <Section
      id="typography"
      title="Tipografía"
      intro="Una sola familia sans para todo el sistema y una monoespaciada para código. Escala modular con pesos y interlineados definidos por token."
    >
      <div className="docs-two">
        <div className="cr-card">
          <p className="cr-card__eyebrow">font-family-sans</p>
          <p className="docs-specimen" style={{ fontFamily: 'var(--font-family-sans)' }}>Inter</p>
          <p className="cr-card__text">Interfaz y contenido. Pesos 400, 500, 600, 700 y 800.</p>
          <p className="docs-glyphs">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 áéíóúñ ¿?¡!</p>
        </div>
        <div className="cr-card">
          <p className="cr-card__eyebrow">font-family-mono</p>
          <p className="docs-specimen" style={{ fontFamily: 'var(--font-family-mono)' }}>JetBrains Mono</p>
          <p className="cr-card__text">Tokens, código y datos técnicos. Pesos 400 y 500.</p>
          <p className="docs-glyphs" style={{ fontFamily: 'var(--font-family-mono)' }}>
            {'const token = "--color-brand"'}<br />0123456789 {'{ } [ ] ( ) =>'}
          </p>
        </div>
      </div>

      <h3 className="docs-h3 docs-h3--lg">Escala</h3>
      <div className="docs-type-list">
        {TYPE_SCALE.map(([size, label, token, weight, lh]) => (
          <div key={size} className="docs-type-row">
            <div className="docs-type-meta">
              <code>{token}</code>
              <span>weight: {weight} · lh: {lh}</span>
            </div>
            <div
              className="docs-type-sample"
              style={{
                fontSize: `var(--${token})`,
                fontWeight: `var(--font-weight-${weight})`,
                lineHeight: `var(--line-height-${lh})`,
                color: 'var(--color-text-primary)',
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Spacing() {
  return (
    <Section id="spacing" title="Espacio y forma" intro="Escala de espaciado de base 4 px, radios y sombras.">
      <h3 className="docs-h3">Espaciado</h3>
      <div className="docs-spacing">
        {SPACING.map((s) => (
          <div key={s} className="docs-spacing-row">
            <code>space-{s}</code>
            <div className="docs-spacing-bar" style={{ width: `var(--space-${s})` }} />
            <span>{Number(s) * 4}px</span>
          </div>
        ))}
      </div>

      <h3 className="docs-h3 docs-h3--lg">Radios</h3>
      <div className="docs-shapes">
        {RADII.map((r) => (
          <div key={r} className="docs-shape">
            <div className="docs-shape-box" style={{ borderRadius: `var(--radius-${r})` }} />
            <code>radius-{r}</code>
          </div>
        ))}
      </div>

      <h3 className="docs-h3 docs-h3--lg">Sombras</h3>
      <div className="docs-shapes">
        {SHADOWS.map((s) => (
          <div key={s} className="docs-shape">
            <div className="docs-shape-box docs-shape-box--shadow" style={{ boxShadow: `var(--shadow-${s})` }} />
            <code>shadow-{s}</code>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Demo({ title, note, code, dark = false, children }) {
  return (
    <div className="docs-demo">
      <h3 className="docs-h3">{title}</h3>
      {note && <p className="docs-note">{note}</p>}
      <div className={`docs-stage${dark ? ' docs-stage--dark cr-on-dark' : ''}`}>{children}</div>
      <Code>{code}</Code>
    </div>
  )
}

function Components() {
  return (
    <Section
      id="components"
      title="Componentes"
      intro="Clases con prefijo cr-. Solo usan tokens semánticos y de componente, por eso funcionan igual en claro y oscuro."
    >
      <Demo
        title="Botón"
        note="Acción principal en naranja con texto oscuro (contraste AA), secundaria, fantasma y variante sobre fondo oscuro."
        code={`<button class="cr-btn cr-btn--primary">Ver mi experiencia</button>
<button class="cr-btn cr-btn--secondary">Descargar CV</button>
<button class="cr-btn cr-btn--ghost">Cancelar</button>
<button class="cr-btn cr-btn--primary" disabled>Deshabilitado</button>`}
      >
        <button className="cr-btn cr-btn--primary">Ver mi experiencia</button>
        <button className="cr-btn cr-btn--secondary">Descargar CV</button>
        <button className="cr-btn cr-btn--ghost">Cancelar</button>
        <button className="cr-btn cr-btn--primary" disabled>Deshabilitado</button>
      </Demo>

      <Demo
        title="Botón sobre fondo oscuro"
        dark
        code={`<button class="cr-btn cr-btn--on-dark">Contactarme</button>`}
      >
        <button className="cr-btn cr-btn--primary">Ver mi experiencia</button>
        <button className="cr-btn cr-btn--on-dark">Contactarme</button>
      </Demo>

      <Demo
        title="Switch"
        note="Un botón con role=&quot;switch&quot; y aria-checked. Los íconos de sol y luna muestran ambos estados; el selector marca el activo. Funciona con Espacio y Enter."
        code={`<button type="button" role="switch" aria-checked="false" aria-label="Modo oscuro" class="cr-switch">
  <span class="cr-switch__icon cr-switch__icon--start"><!-- svg sol --></span>
  <span class="cr-switch__icon cr-switch__icon--end"><!-- svg luna --></span>
  <span class="cr-switch__thumb"><!-- svg del estado actual --></span>
</button>`}
      >
        <SwitchDemo />
      </Demo>

      <Demo
        title="Link"
        code={`<a class="cr-link" href="#">Ver caso completo</a>`}
      >
        <a className="cr-link" href="#components">Ver caso completo</a>
      </Demo>

      <Demo
        title="Tag"
        code={`<span class="cr-tag">Figma</span>
<span class="cr-tag cr-tag--success">Completado</span>
<span class="cr-tag cr-tag--warning">En revisión</span>
<span class="cr-tag cr-tag--danger">Bloqueado</span>`}
      >
        <span className="cr-tag">Figma</span>
        <span className="cr-tag cr-tag--success">Completado</span>
        <span className="cr-tag cr-tag--warning">En revisión</span>
        <span className="cr-tag cr-tag--danger">Bloqueado</span>
      </Demo>

      <Demo
        title="Card"
        code={`<article class="cr-card">
  <p class="cr-card__eyebrow">Design systems</p>
  <h3 class="cr-card__title">Tokens en capas</h3>
  <p class="cr-card__text">Globales, semánticos y de componente.</p>
</article>`}
      >
        <article className="cr-card docs-card-demo">
          <p className="cr-card__eyebrow">Design systems</p>
          <h3 className="cr-card__title">Tokens en capas</h3>
          <p className="cr-card__text">Globales, semánticos y de componente.</p>
        </article>
      </Demo>

      <Demo
        title="Dato destacado"
        code={`<div class="cr-stat">
  <span class="cr-stat__value">60%</span>
  <span class="cr-stat__label">menos tiempo de diseño</span>
</div>`}
      >
        <div className="cr-stat docs-card-demo">
          <span className="cr-stat__value">60%</span>
          <span className="cr-stat__label">menos tiempo de diseño de pantallas</span>
        </div>
      </Demo>

      <Demo
        title="Link de contacto"
        code={`<a class="cr-contact-link" href="mailto:hola@ejemplo.com">hola@ejemplo.com</a>`}
      >
        <a className="cr-contact-link" href="#components">hola@ejemplo.com</a>
        <a className="cr-contact-link" href="#components">linkedin.com/in/usuario</a>
      </Demo>

      <Demo
        title="Título de sección"
        code={`<h2 class="cr-section-title">Experiencia</h2>
<p class="cr-section-subtitle">Trayectoria en diseño de producto</p>`}
      >
        <div>
          <h2 className="cr-section-title">Experiencia</h2>
          <p className="cr-section-subtitle">Trayectoria en diseño de producto</p>
        </div>
      </Demo>

      <Demo
        title="Item de línea de tiempo"
        code={`<div class="cr-timeline-item cr-timeline-item--current">
  <span class="cr-timeline-item__dot"></span>
  <div class="cr-card">…</div>
</div>`}
      >
        <div className="cr-timeline-item cr-timeline-item--current docs-card-demo">
          <span className="cr-timeline-item__dot" />
          <div className="cr-card">
            <h3 className="cr-card__title">Sr. Diseñadora UX/UI</h3>
            <p className="cr-card__text">Oct 2021 – Hoy</p>
          </div>
        </div>
      </Demo>
    </Section>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

function ThemeSwitch({ checked, onChange, label = 'Modo oscuro', className = '' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`cr-switch ${className}`.trim()}
      onClick={onChange}
    >
      <span className="cr-switch__icon cr-switch__icon--start"><SunIcon /></span>
      <span className="cr-switch__icon cr-switch__icon--end"><MoonIcon /></span>
      <span className="cr-switch__thumb">{checked ? <MoonIcon /> : <SunIcon />}</span>
    </button>
  )
}

function SwitchDemo() {
  const [on, setOn] = useState(false)
  return <ThemeSwitch checked={on} onChange={() => setOn(!on)} label="Modo oscuro (ejemplo)" />
}

export default function App() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme)

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    setTheme(next)
  }

  return (
    <div className="docs-layout">
      <a className="docs-skip" href="#main">Saltar al contenido</a>
      <header className="docs-header">
        <a href="#overview" className="docs-brand">Cynthia<span>.</span> <small>design system</small></a>
        <nav aria-label="Secciones">
          <ul className="docs-nav">
            {NAV.map(([id, label]) => (
              <li key={id}><a href={`#${id}`}>{label}</a></li>
            ))}
          </ul>
        </nav>
        <ThemeSwitch className="docs-theme" checked={theme === 'dark'} onChange={toggleTheme} />
      </header>

      <main id="main" tabIndex={-1} className="docs-main">
        <section id="overview" className="docs-hero">
          <p className="cr-card__eyebrow">v0.1.0 · Design system personal</p>
          <h1 className="docs-title">Un sistema, dos modos, accesible desde el token.</h1>
          <p className="docs-lead">
            Base visual de mi portfolio: paleta azul, celeste y naranja, una sola familia tipográfica y componentes
            construidos sobre tokens en capas, validados contra WCAG 2.2.
          </p>
          <div className="docs-layers">
            <div className="cr-card">
              <p className="cr-card__eyebrow">Capa 1</p>
              <h2 className="cr-card__title">Primitivos</h2>
              <p className="cr-card__text">Valores crudos: paletas de 11 tonos, espaciado, radios, tipografía. Ej: <code>--blue-700</code>.</p>
            </div>
            <div className="cr-card">
              <p className="cr-card__eyebrow">Capa 2</p>
              <h2 className="cr-card__title">Semánticos</h2>
              <p className="cr-card__text">Describen el uso y tienen modo claro y oscuro. Ej: <code>--color-brand</code>.</p>
            </div>
            <div className="cr-card">
              <p className="cr-card__eyebrow">Capa 3</p>
              <h2 className="cr-card__title">Componentes</h2>
              <p className="cr-card__text">Tokens por componente apuntando a la capa semántica. Ej: <code>--button-radius</code>.</p>
            </div>
          </div>
          <Code>{`@import './tokens/index.css';   /* primitives + semantic + components */
@import './css/components.css'; /* clases cr-* */

<html data-theme="light"> /* o "dark" */`}</Code>
        </section>

        <Colors />
        <Accessibility />
        <Typography />
        <Spacing />
        <Components />
      </main>

      <footer className="docs-footer">© {new Date().getFullYear()} Cynthia Rivero · Design system personal</footer>
    </div>
  )
}
