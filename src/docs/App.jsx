import { useEffect, useRef, useState } from 'react'
import { resolveRgb, toHex, contrast, grade } from './contrast.js'

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
const SCALES = [
  { name: 'blue', label: 'Azul Rafiki', steps: STEPS },
  { name: 'cyan', label: 'Celeste Stitch', steps: STEPS },
  { name: 'orange', label: 'Naranja Hércules', steps: STEPS },
  { name: 'gray', label: 'Gris Dumbo', steps: STEPS },
]

const SHORT_STEPS = ['50', '100', '300', '500', '700', '900']
const STATUS_SCALES = [
  { name: 'green', label: 'Verde', steps: SHORT_STEPS },
  { name: 'amber', label: 'Amarillo', steps: SHORT_STEPS },
  { name: 'red', label: 'Rojo', steps: SHORT_STEPS },
]

const STATE_NOTE = 'Usar siempre con una etiqueta escrita (Éxito, Advertencia, Error): el estado nunca debe depender solo del color.'

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
  ['Éxito: texto sobre su fondo', 'color-success-text', 'color-success-bg', false, STATE_NOTE],
  ['Advertencia: texto sobre su fondo', 'color-warning-text', 'color-warning-bg', false, STATE_NOTE],
  ['Error: texto sobre su fondo', 'color-danger-text', 'color-danger-bg', false, STATE_NOTE],
  ['Éxito: texto sobre página', 'color-success-text', 'color-bg-page', false, STATE_NOTE],
  ['Advertencia: texto sobre página', 'color-warning-text', 'color-bg-page', false, STATE_NOTE],
  ['Error: texto sobre página', 'color-danger-text', 'color-bg-page', false, STATE_NOTE],
  ['Anillo de foco sobre página (UI, 3:1)', 'color-focus-ring', 'color-bg-page', true],
]

const TYPE_SCALE = [
  ['5xl', 'Display', 'font-size-5xl', 'extrabold', 'tight', 'heading', 'h1 · portada'],
  ['4xl', 'Título de página', 'font-size-4xl', 'extrabold', 'tight', 'heading', 'h1 · página interior'],
  ['3xl', 'Título de sección', 'font-size-3xl', 'bold', 'snug', 'heading', 'h2'],
  ['2xl', 'Subtítulo', 'font-size-2xl', 'bold', 'snug', 'heading', 'h3'],
  ['xl', 'Título de card', 'font-size-xl', 'semibold', 'snug', 'heading', 'h4'],
  ['lg', 'Texto destacado', 'font-size-lg', 'regular', 'normal', 'body', 'h5 · en Nunito bold'],
  ['md', 'Texto de párrafo, base del sistema', 'font-size-md', 'regular', 'normal', 'body', 'h6 · en Nunito bold'],
  ['sm', 'Texto secundario y etiquetas', 'font-size-sm', 'regular', 'normal', 'body', null],
  ['xs', 'Eyebrow y metadatos', 'font-size-xs', 'semibold', 'normal', 'body', null],
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
      intro="Cuatro paletas con nombre: Azul Rafiki, Celeste Stitch, Naranja Hércules y Gris Dumbo, cada una en 11 escalones. El número dentro de cada chip es el mejor contraste posible contra blanco u oscuro."
    >
      {SCALES.map((s) => (
        <div key={s.name} className="docs-block">
          <h3 className="docs-h3">{s.label} <code className="docs-prefix">--{s.name}-*</code></h3>
          <div className="docs-scale">
            {s.steps.map((step) => (
              <Swatch key={step} token={`${s.name}-${step}`} label={step} />
            ))}
          </div>
        </div>
      ))}

      <h3 className="docs-h3 docs-h3--lg">Colores de estado</h3>
      <p className="docs-note">
        Escalas cortas de 6 tonos para éxito (verde), advertencia (amarillo) y error (rojo). Los tonos 50 y 100 sirven de fondo,
        el 300 es el texto sobre fondos oscuros, el 500 es el color de ícono o borde, el 700 es el texto sobre fondos claros y el 900 es el fondo en modo oscuro.
      </p>
      {STATUS_SCALES.map((s) => (
        <div key={s.name} className="docs-block">
          <h4 className="docs-h4">{s.label} <code className="docs-prefix">--{s.name}-*</code></h4>
          <div className="docs-scale">
            {s.steps.map((step) => (
              <Swatch key={step} token={`${s.name}-${step}`} label={step} />
            ))}
          </div>
        </div>
      ))}

      <h3 className="docs-h3 docs-h3--lg">Tokens semánticos</h3>
      <p className="docs-note">
        Describen el uso, no el valor. Cambiá el modo arriba a la derecha: los nombres no cambian, los valores sí.{' '}
        <code>color-bg-subtle</code> (bandas de sección) y <code>color-surface-muted</code> (elementos dentro de una sección o card)
        coinciden en claro y se separan en oscuro.
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
      <div className="docs-table-wrap" tabIndex={0} role="region" aria-label="Tabla de contraste">
        <table className="docs-table">
          <caption className="docs-sr-only">Ratios de contraste de los pares de colores del sistema</caption>
          <thead>
            <tr><th scope="col">Par</th><th scope="col">Muestra</th><th scope="col">Ratio</th><th scope="col">Resultado</th></tr>
          </thead>
          <tbody>
            {PAIRS.map(([label, fg, bg, ui, note]) => {
              const ratio = contrast(resolveRgb(`var(--${fg})`), resolveRgb(`var(--${bg})`))
              const pass = ui ? ratio >= 3 : ratio >= 4.5
              return (
                <tr key={label}>
                  <td>
                    {label}
                    <br />
                    <code>{fg}</code> / <code>{bg}</code>
                    {note && <span className="docs-pair-note">{note}</span>}
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
      <p className="docs-note docs-note--table">
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
      intro="Una familia por rol: Nunito para títulos y encabezados, Nunito Sans para textos comunes y botones, y JetBrains Mono únicamente para mostrar código. Escala modular con pesos e interlineados definidos por token."
    >
      <div className="docs-three">
        <div className="cr-card">
          <p className="cr-card__eyebrow">font-family-heading</p>
          <p className="docs-specimen" style={{ fontFamily: 'var(--font-family-heading)' }}>Nunito</p>
          <p className="cr-card__text">Títulos y encabezados (h1–h6), cifras destacadas. Pesos 400, 600, 700 y 800.</p>
          <p className="docs-glyphs" style={{ fontFamily: 'var(--font-family-heading)' }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 áéíóúñ ¿?¡!</p>
        </div>
        <div className="cr-card">
          <p className="cr-card__eyebrow">font-family-body</p>
          <p className="docs-specimen" style={{ fontFamily: 'var(--font-family-body)' }}>Nunito Sans</p>
          <p className="cr-card__text">Textos comunes, botones y formularios. Pesos 400, 500, 600 y 700.</p>
          <p className="docs-glyphs" style={{ fontFamily: 'var(--font-family-body)' }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 áéíóúñ ¿?¡!</p>
        </div>
        <div className="cr-card">
          <p className="cr-card__eyebrow">font-family-mono</p>
          <p className="docs-specimen" style={{ fontFamily: 'var(--font-family-mono)' }}>JetBrains Mono</p>
          <p className="cr-card__text">Solo para mostrar código: fragmentos, nombres de tokens y valores técnicos. Nunca en interfaz ni contenido. Pesos 400 y 500.</p>
          <p className="docs-glyphs" style={{ fontFamily: 'var(--font-family-mono)' }}>
            {'const token = "--color-brand"'}<br />0123456789 {'{ } [ ] ( ) =>'}
          </p>
        </div>
      </div>

      <h3 className="docs-h3 docs-h3--lg">Escala</h3>
      <p className="docs-note">
        Cada tamaño indica qué nivel de encabezado le corresponde, y se aplica por defecto a las etiquetas h1–h6 (<code>base.css</code>).
        El tamaño display no es una etiqueta: se usa con la clase <code>cr-display</code> sobre el h1 de la portada. Hay un solo h1 por página y los niveles
        se usan en orden, sin saltos (h1, h2, h3…). h5 y h6 se distinguen por la tipografía de títulos en negrita. En móvil, h1 baja a 3xl y display a 4xl.
      </p>
      <div className="docs-type-list">
        {TYPE_SCALE.map(([size, label, token, weight, lh, family, heading]) => (
          <div key={size} className="docs-type-row">
            <div className="docs-type-meta">
              <code>{token}</code>
              <span>{family} · weight: {weight} · lh: {lh}</span>
              <span className="docs-type-heading">
                {heading ? <>Encabezado: <strong>{heading}</strong></> : 'Texto (no es encabezado)'}
              </span>
            </div>
            <div
              className="docs-type-sample"
              style={{
                fontFamily: `var(--font-family-${family})`,
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

function tokenValue(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function TokenColumn({ title, rows }) {
  return (
    <div className="docs-token-col">
      <h3 className="docs-token-title">{title}</h3>
      {rows.map(({ name, visual, value }) => (
        <div key={name} className="docs-token-row">
          <code>{name}</code>
          <div className="docs-token-visual">{visual}</div>
          <span className="docs-token-value">{value}</span>
        </div>
      ))}
    </div>
  )
}

function Spacing() {
  const spacing = SPACING.map((s) => ({
    name: `space-${s}`,
    visual: <div className="docs-token-bar" style={{ width: `var(--space-${s})` }} />,
    value: `${Number(s) * 4}px`,
  }))
  const radii = RADII.map((r) => ({
    name: `radius-${r}`,
    visual: <div className="docs-token-box" style={{ borderRadius: `var(--radius-${r})` }} />,
    value: tokenValue(`--radius-${r}`),
  }))
  const shadows = SHADOWS.map((s) => ({
    name: `shadow-${s}`,
    visual: <div className="docs-token-box docs-token-box--shadow" style={{ boxShadow: `var(--shadow-${s})` }} />,
    value: tokenValue(`--shadow-${s}`).replace(/rgba?\([^)]*\)/, '').trim(),
  }))

  return (
    <Section id="spacing" title="Espacio y forma" intro="Escala de espaciado de base 4 px, radios y sombras.">
      <div className="docs-token-block">
        <TokenColumn title="Espaciado" rows={spacing} />
        <TokenColumn title="Radios" rows={radii} />
        <TokenColumn title="Sombras" rows={shadows} />
      </div>
    </Section>
  )
}

function Demo({ title, note, code, dark = false, light = false, children }) {
  return (
    <div className="docs-demo">
      <h3 className="docs-h3">{title}</h3>
      {note && <p className="docs-note">{note}</p>}
      <div className={`docs-stage${dark ? ' docs-stage--dark cr-on-dark' : ''}${light ? ' cr-on-light' : ''}`}>{children}</div>
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
        note="Acción principal en naranja con texto oscuro (contraste AA), secundaria y fantasma."
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
        title="Link"
        note="Sin subrayado por defecto; se subraya al pasar el mouse o al enfocar con teclado."
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
        title="Superficie oscura"
        note="Para un fondo oscuro dentro de una página clara, envolvé el bloque en cr-on-dark. Remapea los tokens semánticos con los valores del modo oscuro, así todos los componentes (no solo los botones) mantienen el contraste sin variantes propias."
        dark
        code={`<section class="cr-on-dark">
  <button class="cr-btn cr-btn--primary">Ver mi experiencia</button>
  <button class="cr-btn cr-btn--secondary">Contactarme</button>
  <button class="cr-btn cr-btn--ghost">Cancelar</button>
  <a class="cr-link" href="#">Ver más</a>
  <span class="cr-tag">Figma</span>
</section>`}
      >
        <button className="cr-btn cr-btn--primary">Ver mi experiencia</button>
        <button className="cr-btn cr-btn--secondary">Contactarme</button>
        <button className="cr-btn cr-btn--ghost">Cancelar</button>
        <a className="cr-link" href="#components">Ver más</a>
        <span className="cr-tag">Figma</span>
      </Demo>

      <Demo
        title="Superficie clara"
        note="Es la versión inversa: un contenedor claro dentro de una página en modo oscuro (por ejemplo, una tarjeta blanca). Envolvé el bloque en cr-on-light y los tokens semánticos toman los valores del modo claro. Cambiá el switch del encabezado a modo oscuro para ver la diferencia."
        light
        code={`<section class="cr-on-light">
  <button class="cr-btn cr-btn--primary">Ver mi experiencia</button>
  <button class="cr-btn cr-btn--secondary">Contactarme</button>
  <button class="cr-btn cr-btn--ghost">Cancelar</button>
  <a class="cr-link" href="#">Ver más</a>
  <span class="cr-tag">Figma</span>
</section>`}
      >
        <button className="cr-btn cr-btn--primary">Ver mi experiencia</button>
        <button className="cr-btn cr-btn--secondary">Contactarme</button>
        <button className="cr-btn cr-btn--ghost">Cancelar</button>
        <a className="cr-link" href="#components">Ver más</a>
        <span className="cr-tag">Figma</span>
      </Demo>

      <div className="docs-demo">
        <h3 className="docs-h3">Selectores</h3>
        <p className="docs-note">
          Controles para elegir opciones. El switch activa o desactiva algo al instante, el checkbox permite marcar varias opciones y el radio permite
          elegir una sola dentro de un grupo. Son controles reales (un botón con role=&quot;switch&quot; y dos inputs nativos), así que funcionan con teclado y lectores de pantalla.
          En hover cambian el fondo, el borde y el halo, tanto marcados como desmarcados; deshabilitados bajan su opacidad y no responden al hover.
        </p>

        <h4 className="docs-h4">Estados</h4>
        <SelectorsMatrix />

        <h4 className="docs-h4 docs-h4--space">En uso</h4>
        <div className="docs-stage">
          <SelectorsLive />
        </div>

        <h4 className="docs-h4 docs-h4--space">Código</h4>
        <Code>{`<button type="button" role="switch" aria-checked="false" aria-label="Notificaciones" class="cr-switch">
  <span class="cr-switch__icon cr-switch__icon--start"><!-- svg --></span>
  <span class="cr-switch__icon cr-switch__icon--end"><!-- svg --></span>
  <span class="cr-switch__thumb"><!-- svg del estado actual --></span>
</button>`}</Code>
        <Code>{`<label class="cr-choice">
  <input type="checkbox" class="cr-checkbox" checked />
  <span>Accesibilidad</span>
</label>`}</Code>
        <Code>{`<label class="cr-choice">
  <input type="radio" name="modo" class="cr-radio" checked />
  <span>Modo claro</span>
</label>`}</Code>
      </div>

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
        note="El texto se subraya al pasar el mouse o enfocar con teclado. Si hay un ícono, va fuera de cr-contact-link__text para que no se subraye."
        code={`<a class="cr-contact-link" href="mailto:hola@ejemplo.com">
  <span class="cr-contact-link__text">hola@ejemplo.com</span>
</a>`}
      >
        <a className="cr-contact-link" href="#components"><span className="cr-contact-link__text">hola@ejemplo.com</span></a>
        <a className="cr-contact-link" href="#components"><span className="cr-contact-link__text">linkedin.com/in/usuario</span></a>
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

function ThemeSwitch({ checked, onChange, label = 'Modo oscuro', className = '', disabled = false, tabIndex }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`cr-switch ${className}`.trim()}
      onClick={onChange}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      <span className="cr-switch__icon cr-switch__icon--start"><SunIcon /></span>
      <span className="cr-switch__icon cr-switch__icon--end"><MoonIcon /></span>
      <span className="cr-switch__thumb">{checked ? <MoonIcon /> : <SunIcon />}</span>
    </button>
  )
}

const SELECTOR_STATES = [
  { key: 'default', label: 'Desmarcado', checked: false },
  { key: 'hover', label: 'Desmarcado + hover', checked: false, hover: true },
  { key: 'selected', label: 'Marcado', checked: true },
  { key: 'selected-hover', label: 'Marcado + hover', checked: true, hover: true },
  { key: 'disabled', label: 'Deshabilitado', checked: false, disabled: true },
  { key: 'disabled-selected', label: 'Deshabilitado + marcado', checked: true, disabled: true },
]

function SelectorsLive() {
  const [sw, setSw] = useState(true)
  const [checks, setChecks] = useState({ a11y: true, tokens: false })
  const [radio, setRadio] = useState('claro')
  return (
    <div className="docs-selectors-live">
      <div className="docs-selectors-live-group">
        <p className="docs-selectors-live-title">Switch</p>
        <label className="cr-choice">
          <ThemeSwitch checked={sw} onChange={() => setSw(!sw)} label="Notificaciones" />
          <span>Notificaciones</span>
        </label>
      </div>
      <fieldset className="docs-selectors-live-group">
        <legend className="docs-selectors-live-title">Checkbox</legend>
        <label className="cr-choice">
          <input type="checkbox" className="cr-checkbox" checked={checks.a11y} onChange={(e) => setChecks({ ...checks, a11y: e.target.checked })} />
          <span>Accesibilidad</span>
        </label>
        <label className="cr-choice">
          <input type="checkbox" className="cr-checkbox" checked={checks.tokens} onChange={(e) => setChecks({ ...checks, tokens: e.target.checked })} />
          <span>Tokens</span>
        </label>
        <label className="cr-choice">
          <input type="checkbox" className="cr-checkbox" disabled />
          <span>Deshabilitado</span>
        </label>
      </fieldset>
      <fieldset className="docs-selectors-live-group">
        <legend className="docs-selectors-live-title">Radio</legend>
        {['claro', 'oscuro'].map((v) => (
          <label key={v} className="cr-choice">
            <input type="radio" name="docs-radio-live" className="cr-radio" checked={radio === v} onChange={() => setRadio(v)} />
            <span>{v === 'claro' ? 'Modo claro' : 'Modo oscuro'}</span>
          </label>
        ))}
        <label className="cr-choice">
          <input type="radio" name="docs-radio-live" className="cr-radio" disabled />
          <span>Deshabilitado</span>
        </label>
      </fieldset>
    </div>
  )
}

function SelectorsMatrix() {
  return (
    <div className="docs-table-wrap" tabIndex={0} role="region" aria-label="Tabla de estados de los selectores">
      <table className="docs-table docs-selectors-table">
        <caption className="docs-sr-only">Estados de los selectores</caption>
        <thead>
          <tr>
            <th scope="col">Estado</th>
            <th scope="col">Switch</th>
            <th scope="col">Checkbox</th>
            <th scope="col">Radio</th>
          </tr>
        </thead>
        <tbody>
          {SELECTOR_STATES.map((s) => {
            const cls = s.hover ? 'is-hover' : ''
            return (
              <tr key={s.key}>
                <th scope="row">{s.label}</th>
                <td>
                  <ThemeSwitch checked={s.checked} onChange={() => {}} label={`Switch: ${s.label}`} className={cls} disabled={s.disabled} tabIndex={-1} />
                </td>
                <td>
                  <input
                    type="checkbox"
                    className={`cr-checkbox ${cls}`.trim()}
                    checked={s.checked}
                    onChange={() => {}}
                    disabled={s.disabled}
                    tabIndex={-1}
                    aria-label={`Checkbox: ${s.label}`}
                  />
                </td>
                <td>
                  <input
                    type="radio"
                    name={`docs-radio-${s.key}`}
                    className={`cr-radio ${cls}`.trim()}
                    checked={s.checked}
                    onChange={() => {}}
                    disabled={s.disabled}
                    tabIndex={-1}
                    aria-label={`Radio: ${s.label}`}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* Devuelve el id de la sección donde está parada la persona (null si todavía no llegó a la primera) */
function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  const key = ids.join()

  useEffect(() => {
    if (!ids.length) return undefined
    let raf = 0
    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.35
      let current = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1]
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return active
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

/* Flecha flotante: aparece al llegar a la última sección y vuelve al inicio con scroll suave */
function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const check = () => {
      const last = document.querySelector('main > section:last-of-type')
      setVisible(last ? last.getBoundingClientRect().top < window.innerHeight : window.scrollY > window.innerHeight)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  function goTop() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    document.getElementById('main')?.focus({ preventScroll: true })
  }

  return (
    <button type="button" className="docs-back-to-top" data-visible={visible} onClick={goTop} aria-label="Ir hacia arriba">
      <ArrowUpIcon />
      <span className="docs-back-to-top-tip" aria-hidden="true">Ir hacia arriba</span>
    </button>
  )
}

export default function App() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme)
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef(null)
  const active = useActiveSection(NAV.map(([id]) => id))

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    setTheme(next)
  }

  return (
    <div className="docs-layout">
      <a className="docs-skip" href="#main">Saltar al contenido</a>
      <header className="docs-header">
        <a href="#overview" className="docs-brand"><span className="docs-brand-text">Cynthia<span>.</span> <small>design system</small></span></a>
        <nav aria-label="Secciones">
          <ul id="docs-nav-menu" className={`docs-nav${menuOpen ? ' is-open' : ''}`}>
            {NAV.map(([id, label]) => (
              <li key={id}><a href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="docs-header-actions">
          <ThemeSwitch className="docs-theme" checked={theme === 'dark'} onChange={toggleTheme} />
          <button
            type="button"
            ref={toggleRef}
            className="docs-nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="docs-nav-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="docs-main">
        <header className="docs-hero">
          <p className="cr-card__eyebrow">v1.1.0 · Design system personal</p>
          <h1 className="docs-title">Un sistema, dos modos, accesible desde el token.</h1>
        </header>

        <Section
          id="overview"
          title="Principios"
          intro="Base visual de mi portfolio: paleta azul, celeste y naranja, tres familias tipográficas (títulos, texto y código) y componentes construidos sobre tokens en capas, validados contra WCAG 2.2."
        >
          <div className="docs-layers">
            <div className="cr-card">
              <p className="cr-card__eyebrow">Capa 1</p>
              <h3 className="cr-card__title">Primitivos</h3>
              <p className="cr-card__text">Valores crudos: paletas de 11 tonos, espaciado, radios, tipografía. Ej: <code>--blue-700</code>.</p>
            </div>
            <div className="cr-card">
              <p className="cr-card__eyebrow">Capa 2</p>
              <h3 className="cr-card__title">Semánticos</h3>
              <p className="cr-card__text">Describen el uso y tienen modo claro y oscuro. Ej: <code>--color-brand</code>.</p>
            </div>
            <div className="cr-card">
              <p className="cr-card__eyebrow">Capa 3</p>
              <h3 className="cr-card__title">Componentes</h3>
              <p className="cr-card__text">Tokens por componente apuntando a la capa semántica. Ej: <code>--button-radius</code>.</p>
            </div>
          </div>
          <Code>{`@import './tokens/index.css';   /* primitives + semantic + components */
@import './css/components.css'; /* clases cr-* */

<html data-theme="light"> /* o "dark" */`}</Code>
        </Section>

        <Colors />
        <Accessibility />
        <Typography />
        <Spacing />
        <Components />
      </main>

      <BackToTop />
      <footer className="docs-footer">
        <p>© {new Date().getFullYear()} Cynthia Rivero · Design system personal · Diseñada con <span role="img" aria-label="amor">♥</span> en Buenos Aires</p>
        <p>Actualizado: <time dateTime="2026-11-16">16 de noviembre de 2026</time></p>
      </footer>
    </div>
  )
}
