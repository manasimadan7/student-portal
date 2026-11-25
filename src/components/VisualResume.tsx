import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import {
  accents,
  fixedSections,
  fonts,
  formatRange,
  PAGE_H,
  PAGE_W,
  textColors,
  textRoles,
  type Block,
  type ResumeStyle,
  type Section,
  type Template,
  type TextRole,
  type TextStyle,
} from '../data/resume'
import expandMore from '../assets/icons/expand-more.svg'
import expandMoreSm from '../assets/icons/expand-more-sm.svg'
import gridView from '../assets/icons/grid-view.svg'
import printIcon from '../assets/icons/print.svg'
import dragIcon from '../assets/icons/drag-indicator.svg'
import './VisualResume.css'

type Panel = 'font' | 'layout' | null
type SetStyle = (fn: (s: ResumeStyle) => ResumeStyle) => void

const MARGIN_MIN = 0
const MARGIN_MAX = 48
const MARGIN_STEP = 4
const SIDE = ['skills', 'education'] // go in the narrow column of 2-column templates
const GRID = 4 // boxes snap to a 4px grid
const MIN_W = 40
const MIN_H = 24

const snap = (v: number) => Math.round(v / GRID) * GRID
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/* Figma 469:3915 (preview) + 350:18291 (style controls: default / Font open / Layout open) */
export default function VisualResume({ sections, style, onStyle }: { sections: Section[]; style: ResumeStyle; onStyle: SetStyle }) {
  const [panel, setPanel] = useState<Panel>(null)
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(0.6)
  const [zoomed, setZoomed] = useState(false)

  // Render the page at A4 (595 × 842) and scale it to the column width.
  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setFit(e.contentRect.width / PAGE_W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scale = zoomed ? 1 : fit

  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p))
  const setText = (role: TextRole, patch: Partial<TextStyle>) => onStyle((s) => ({ ...s, text: { ...s.text, [role]: { ...s.text[role], ...patch } } }))
  const stepMargin = (by: number) => onStyle((s) => ({ ...s, margin: clamp(s.margin + by, MARGIN_MIN, MARGIN_MAX) }))

  // Every orderable section: content sections + Skills/Education, in saved order.
  const all = [...sections.map((s) => ({ id: s.id, name: s.name })), ...fixedSections]
  const order = [...style.order.filter((id) => all.some((a) => a.id === id)), ...all.filter((a) => !style.order.includes(a.id)).map((a) => a.id)]
  const nameOf = (id: string) => all.find((a) => a.id === id)?.name ?? id

  /* ---------- custom layout (boxes) ---------- */
  const custom = style.template === 'custom'
  const blocks = style.blocks ?? []
  const setBlocks = (fn: (b: Block[]) => Block[]) => onStyle((s) => ({ ...s, blocks: fn(s.blocks ?? []) }))
  const updateBlock = (id: string, patch: Partial<Block>) => setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const removeBlock = (id: string) => {
    setBlocks((bs) => bs.filter((b) => b.id !== id))
    setSelected(null)
  }
  const addBlock = (b: Omit<Block, 'id'>) => {
    const id = `b-${Date.now()}`
    setBlocks((bs) => [...bs, { ...b, id }])
    setSelected(id)
  }

  const startCustomize = () => {
    onStyle((s) => ({
      ...s,
      template: 'custom',
      blocks: s.blocks?.length ? s.blocks : defaultBlocks(order, sections),
    }))
    setEditing(true)
  }
  const stopCustomize = () => {
    setEditing(false)
    setSelected(null)
  }

  /* ---------- content ---------- */
  const t = style.text
  const vars = {
    '--ink': accents[style.accent].ink,
    fontFamily: fonts[style.font].css,
    padding: custom ? 0 : style.margin * 1.5,
    ...roleVars('intro', t.intro),
    ...roleVars('heading', t.heading),
    ...roleVars('sub', t.subheading),
    ...roleVars('body', t.body),
    ...roleVars('date', t.date),
  } as CSSProperties

  const intro = (
    <>
      <h2 className="pp-name">Srishti Sharma</h2>
      <p className="pp-role">B.Tech Computer Science · Class of 2027</p>
      <p className="pp-contact">
        <u>srishti@college.edu</u> | (555) 654-3210 | <u>linkedin.com/in/srishti</u> | Bengaluru, IN
      </p>
    </>
  )
  const summary = (
    <PaperSection title="Summary">
      <p>Product-minded engineer with internships across Microsoft, Google and Amazon. Enjoys turning messy data into clear decisions and shipping student-facing tools.</p>
    </PaperSection>
  )

  const renderSection = (id: string, respectHidden = true) => {
    if (respectHidden && style.hidden.includes(id)) return null
    if (id === 'skills')
      return (
        <PaperSection key={id} title="Skills">
          <p>
            <b>Languages:</b> Python, TypeScript, SQL
          </p>
          <p>
            <b>Tools:</b> Figma, React, Pandas, Excel
          </p>
        </PaperSection>
      )
    if (id === 'education')
      return (
        <PaperSection key={id} title="Education">
          <p className="pp-entry__head">
            <span className="pp-sub">B.Tech, Computer Science</span>
            <span className="pp-date">Aug 2023 – May 2027</span>
          </p>
          <p>CGPA 8.7</p>
        </PaperSection>
      )
    const s = sections.find((x) => x.id === id)
    if (!s || !s.entries.length) return null
    return (
      <PaperSection key={id} title={s.name}>
        {s.entries.map((e) => (
          <div key={e.id} className="pp-entry">
            <p className="pp-entry__head">
              <span className="pp-sub">
                {e.title} | {e.kind[0].toUpperCase() + e.kind.slice(1)}
              </span>
              {e.start && <span className="pp-date">{formatRange(e.start, e.end)}</span>}
            </p>
            <ul>
              <li>{e.description}</li>
            </ul>
          </div>
        ))}
      </PaperSection>
    )
  }

  const renderBlock = (b: Block) => {
    if (b.content === 'intro') return intro
    if (b.content === 'summary') return summary
    if (b.content === 'text')
      return b.text?.trim() ? <p className="pp-text">{b.text}</p> : editing ? <p className="pp-text pp-text--empty">Text box — type in the Layout panel</p> : null
    return renderSection(b.content, false)
  }

  const contentOptions = [
    { id: 'text', label: 'Text' },
    { id: 'intro', label: 'Intro (name & contact)' },
    { id: 'summary', label: 'Summary' },
    ...all.map((a) => ({ id: a.id, label: a.name })),
  ]

  /* ---------- pointer editing on the page ---------- */
  // `rect` keeps the live draw rectangle so a quick release never reads a stale render.
  const drag = useRef<{ mode: 'move' | 'resize' | 'draw'; id: string; sx: number; sy: number; orig: Block; rect?: Block } | null>(null)
  const [drawRect, setDrawRect] = useState<Block | null>(null) // for display only

  const toPage = (e: PointerEvent) => {
    const r = paperRef.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }
  }

  const onPaperDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!editing) return
    paperRef.current?.focus({ preventScroll: true })
    const p = toPage(e)
    const target = e.target as Element
    const blockEl = target.closest<HTMLElement>('[data-block]')
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    if (blockEl) {
      const id = blockEl.dataset.block!
      const orig = blocks.find((b) => b.id === id)!
      setSelected(id)
      drag.current = { mode: target.closest('[data-handle]') ? 'resize' : 'move', id, sx: p.x, sy: p.y, orig }
    } else {
      const start = { id: 'draw', x: snap(p.x), y: snap(p.y), w: 0, h: 0, content: 'text' }
      drag.current = { mode: 'draw', id: 'draw', sx: p.x, sy: p.y, orig: start }
      setDrawRect(start)
    }
    e.preventDefault()
  }

  const onPaperMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const p = toPage(e)
    const dx = p.x - d.sx
    const dy = p.y - d.sy
    const o = d.orig
    if (d.mode === 'move') {
      updateBlock(d.id, { x: clamp(snap(o.x + dx), 0, PAGE_W - o.w), y: clamp(snap(o.y + dy), 0, PAGE_H - o.h) })
    } else if (d.mode === 'resize') {
      updateBlock(d.id, { w: clamp(snap(o.w + dx), MIN_W, PAGE_W - o.x), h: clamp(snap(o.h + dy), MIN_H, PAGE_H - o.y) })
    } else {
      const x1 = clamp(snap(Math.min(d.sx, p.x)), 0, PAGE_W)
      const y1 = clamp(snap(Math.min(d.sy, p.y)), 0, PAGE_H)
      const x2 = clamp(snap(Math.max(d.sx, p.x)), 0, PAGE_W)
      const y2 = clamp(snap(Math.max(d.sy, p.y)), 0, PAGE_H)
      d.rect = { ...o, x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
      setDrawRect(d.rect)
    }
  }

  const onPaperUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (d?.mode === 'draw') onPaperMove(e) // include the release point
    drag.current = null
    if (d?.mode === 'draw') {
      const r = d.rect
      setDrawRect(null)
      if (r && r.w >= MIN_W && r.h >= MIN_H) addBlock({ x: r.x, y: r.y, w: r.w, h: r.h, content: 'text', text: '' })
      else setSelected(null) // a plain tap on empty page deselects
    }
  }

  const onPaperKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!editing || !selected) return
    const b = blocks.find((x) => x.id === selected)
    if (!b) return
    const step = e.shiftKey ? 16 : GRID
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (moves[e.key]) {
      e.preventDefault()
      const [mx, my] = moves[e.key]
      updateBlock(b.id, { x: clamp(b.x + mx, 0, PAGE_W - b.w), y: clamp(b.y + my, 0, PAGE_H - b.h) })
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      removeBlock(b.id)
    } else if (e.key === 'Escape') setSelected(null)
  }

  const main = style.template === 'single' ? order : order.filter((id) => !SIDE.includes(id))
  const side = style.template === 'single' ? [] : order.filter((id) => SIDE.includes(id))
  const sel = blocks.find((b) => b.id === selected) ?? null

  return (
    <div className="rs-visual">
      {/* ---------- Controls ---------- */}
      <div className="rs-tools" role="toolbar" aria-label="Resume style">
        <button className="tool" aria-expanded={panel === 'font'} onClick={() => toggle('font')}>
          Font
          <img src={expandMore} alt="" className={panel === 'font' ? 'is-open' : ''} />
        </button>
        {panel === 'font' && <FontPanel style={style} onFont={(font) => onStyle((s) => ({ ...s, font }))} setText={setText} />}

        <div className="tool tool--colors" role="radiogroup" aria-label="Colour">
          <span>Colour</span>
          {accents.map((a, i) => (
            <button
              key={a.swatch}
              role="radio"
              aria-checked={i === style.accent}
              aria-label={`Accent ${a.swatch}`}
              className={`dot${i === style.accent ? ' is-active' : ''}`}
              style={{ background: a.swatch }}
              onClick={() => onStyle((s) => ({ ...s, accent: i }))}
            />
          ))}
        </div>

        {/* Margin with up/down stepper */}
        <div className="tool tool--margin" role="group" aria-label="Margin">
          <span>Margin</span>
          <b aria-live="polite">{style.margin}px</b>
          <span className="stepper">
            <button aria-label="Increase margin" disabled={style.margin >= MARGIN_MAX} onClick={() => stepMargin(MARGIN_STEP)}>
              <img src={expandMoreSm} alt="" className="stepper__up" />
            </button>
            <button aria-label="Decrease margin" disabled={style.margin <= MARGIN_MIN} onClick={() => stepMargin(-MARGIN_STEP)}>
              <img src={expandMoreSm} alt="" />
            </button>
          </span>
        </div>

        <div className="tool-row">
          <button className="tool" aria-expanded={panel === 'layout'} onClick={() => toggle('layout')}>
            <img src={gridView} alt="" />
            Layout
          </button>
          <button className="tool tool--icon" aria-label="Print" onClick={() => window.print()}>
            <img src={printIcon} alt="" />
          </button>
        </div>
        {panel === 'layout' && (
          <LayoutPanel
            template={style.template}
            onTemplate={(template) => {
              stopCustomize()
              onStyle((s) => ({ ...s, template }))
            }}
            editing={editing}
            onCustomize={() => (editing ? stopCustomize() : startCustomize())}
            order={order}
            hidden={style.hidden}
            nameOf={nameOf}
            onOrder={(o) => onStyle((s) => ({ ...s, order: o }))}
            onHidden={(h) => onStyle((s) => ({ ...s, hidden: h }))}
            selected={sel}
            contentOptions={contentOptions}
            onAddBlock={() => addBlock({ x: 148, y: 380, w: 300, h: 80, content: 'text', text: '' })}
            onUpdateBlock={updateBlock}
            onRemoveBlock={removeBlock}
            onResetBlocks={() => {
              setSelected(null)
              onStyle((s) => ({ ...s, blocks: defaultBlocks(order, sections) }))
            }}
          />
        )}
      </div>

      {/* ---------- Preview ---------- */}
      <div className="rs-hint">
        {editing && <span className="rs-hint__edit">Editing layout — drag on the page to draw a box</span>}
        <button className="rs-hint__zoom" onClick={() => setZoomed(!zoomed)}>
          {zoomed ? 'Fit page' : 'Zoom page'}
        </button>
      </div>
      <div className={`rs-frame${zoomed ? ' is-zoomed' : ''}`} ref={frameRef} style={{ height: PAGE_H * scale }}>
        <div
          ref={paperRef}
          className={`rs-paper${custom ? ' rs-paper--custom' : ''}${editing ? ' is-editing' : ''}`}
          style={{ ...vars, transform: `scale(${scale})` }}
          onPointerDown={onPaperDown}
          onPointerMove={onPaperMove}
          onPointerUp={onPaperUp}
          onPointerCancel={onPaperUp}
          onKeyDown={onPaperKey}
          tabIndex={editing ? 0 : -1}
          aria-label={editing ? 'Resume page. Drag to draw boxes; arrow keys move the selected box, Delete removes it.' : undefined}
        >
          <span className="pp-bar" aria-hidden />
          {custom ? (
            <>
              {blocks.map((b) => (
                <div
                  key={b.id}
                  data-block={b.id}
                  className={`pp-block${b.id === selected && editing ? ' is-selected' : ''}`}
                  style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                >
                  <div className="pp-block__inner">{renderBlock(b)}</div>
                  {editing && <span className="pp-block__handle" data-handle aria-hidden />}
                </div>
              ))}
              {drawRect && drawRect.w > 0 && <div className="pp-draw" style={{ left: drawRect.x, top: drawRect.y, width: drawRect.w, height: drawRect.h }} />}
            </>
          ) : (
            <>
              {intro}
              {!style.hidden.includes('summary') && summary}
              <div className={`pp-body pp-body--${style.template}`}>
                <div className="pp-main">{main.map((id) => renderSection(id))}</div>
                {side.length > 0 && <div className="pp-side">{side.map((id) => renderSection(id))}</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* Starting layout for Customize: intro + summary on top, main sections left, Skills/Education right. */
function defaultBlocks(order: string[], sections: Section[]): Block[] {
  const pad = 36
  const gap = 12
  const mainW = 340
  const sideX = pad + mainW + 16
  const sideW = PAGE_W - pad - sideX
  const out: Block[] = [
    { id: 'b-intro', x: pad, y: 24, w: PAGE_W - pad * 2, h: 68, content: 'intro' },
    { id: 'b-summary', x: pad, y: 100, w: PAGE_W - pad * 2, h: 60, content: 'summary' },
  ]
  let y = 172
  for (const id of order.filter((o) => !SIDE.includes(o))) {
    const s = sections.find((x) => x.id === id)
    if (!s || !s.entries.length) continue
    const h = Math.min(snap(30 + s.entries.length * 46), PAGE_H - y - pad)
    if (h < MIN_H) break
    out.push({ id: `b-${id}`, x: pad, y, w: mainW, h, content: id })
    y += h + gap
  }
  let sy = 172
  for (const id of SIDE) {
    const h = id === 'skills' ? 72 : 64
    out.push({ id: `b-${id}`, x: sideX, y: sy, w: sideW, h, content: id })
    sy += h + gap
  }
  return out
}

function roleVars(prefix: string, s: TextStyle) {
  return {
    [`--${prefix}-size`]: `${s.size}px`,
    [`--${prefix}-weight`]: s.bold ? 700 : 400,
    [`--${prefix}-style`]: s.italic ? 'italic' : 'normal',
    [`--${prefix}-color`]: textColors[s.color],
  }
}

function PaperSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pp-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

/* ---------------- Font panel (350:18314) ---------------- */

function FontPanel({ style, onFont, setText }: { style: ResumeStyle; onFont: (i: number) => void; setText: (r: TextRole, p: Partial<TextStyle>) => void }) {
  return (
    <div className="tool-panel font-panel">
      <label className="font-select">
        <span className="sr-only">Font family</span>
        <select value={style.font} onChange={(e) => onFont(Number(e.target.value))} style={{ fontFamily: fonts[style.font].css }}>
          {fonts.map((f, i) => (
            <option key={f.label} value={i}>
              {f.label}
            </option>
          ))}
        </select>
        <img src={expandMoreSm} alt="" />
      </label>

      <ul className="type-rows">
        {textRoles.map(({ id, label }) => {
          const s = style.text[id]
          return (
            <li key={id}>
              <span className="type-rows__name">{label}</span>
              <input
                className="size-box"
                type="number"
                inputMode="numeric"
                min={6}
                max={40}
                value={s.size}
                aria-label={`${label} size`}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  if (n >= 6 && n <= 40) setText(id, { size: n })
                }}
              />
              <button className={`type-btn type-btn--b${s.bold ? ' is-on' : ''}`} aria-pressed={s.bold} aria-label={`${label} bold`} onClick={() => setText(id, { bold: !s.bold })}>
                B
              </button>
              <button className={`type-btn type-btn--i${s.italic ? ' is-on' : ''}`} aria-pressed={s.italic} aria-label={`${label} italic`} onClick={() => setText(id, { italic: !s.italic })}>
                I
              </button>
              <button
                className="type-dot"
                style={{ background: textColors[s.color] }}
                aria-label={`${label} colour, tap to change`}
                onClick={() => setText(id, { color: (s.color + 1) % textColors.length })}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ---------------- Layout panel (411:6185) ---------------- */

const templates: { id: Exclude<Template, 'custom'>; label: string }[] = [
  { id: 'main-left', label: 'Two columns, main left' },
  { id: 'main-right', label: 'Two columns, main right' },
  { id: 'single', label: 'Single column' },
]

function LayoutPanel({
  template,
  onTemplate,
  editing,
  onCustomize,
  order,
  hidden,
  nameOf,
  onOrder,
  onHidden,
  selected,
  contentOptions,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
  onResetBlocks,
}: {
  template: Template
  onTemplate: (t: Template) => void
  editing: boolean
  onCustomize: () => void
  order: string[]
  hidden: string[]
  nameOf: (id: string) => string
  onOrder: (o: string[]) => void
  onHidden: (h: string[]) => void
  selected: Block | null
  contentOptions: { id: string; label: string }[]
  onAddBlock: () => void
  onUpdateBlock: (id: string, p: Partial<Block>) => void
  onRemoveBlock: (id: string) => void
  onResetBlocks: () => void
}) {
  const [dragging, setDragging] = useState<string | null>(null)
  const drag = useRef({ y: 0, id: '' })
  const ROW = 39 // row height + gap, as in Figma (32 + 7)

  const move = (id: string, by: number) => {
    const i = order.indexOf(id)
    const j = i + by
    if (j < 0 || j >= order.length) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    onOrder(next)
  }

  // Pointer drag: swap with the neighbour each time the row crosses half a row.
  const onDown = (e: PointerEvent<HTMLButtonElement>, id: string) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* capture unavailable — drag still works while the pointer stays on the handle */
    }
    drag.current = { y: e.clientY, id }
    setDragging(id)
  }
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return
    const dy = e.clientY - drag.current.y
    if (Math.abs(dy) > ROW / 2) {
      const by = dy > 0 ? 1 : -1
      move(drag.current.id, by)
      drag.current.y += by * ROW
    }
  }
  const onUp = () => setDragging(null)
  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'ArrowUp') (e.preventDefault(), move(id, -1))
    if (e.key === 'ArrowDown') (e.preventDefault(), move(id, 1))
  }

  const custom = template === 'custom'

  return (
    <div className="tool-panel layout-panel">
      <p className="panel-h">Templates</p>
      <div className="templates" role="radiogroup" aria-label="Template">
        {templates.map((tp) => (
          <button key={tp.id} role="radio" aria-checked={template === tp.id} aria-label={tp.label} className={`tpl tpl--${tp.id}${template === tp.id ? ' is-active' : ''}`} onClick={() => onTemplate(tp.id)}>
            <i className="tpl__bar" />
            {tp.id === 'single' ? (
              <>
                <i className="tpl__row" />
                <i className="tpl__row" />
                <i className="tpl__row" />
                <i className="tpl__row" />
              </>
            ) : (
              <>
                <i className="tpl__col tpl__col--a" />
                <i className="tpl__col tpl__col--b" />
              </>
            )}
          </button>
        ))}
      </div>
      <button className={`customize${custom ? ' is-on' : ''}`} aria-pressed={editing} onClick={onCustomize}>
        {editing ? 'Done' : custom ? 'Edit custom layout' : 'Customize'}
      </button>

      {editing ? (
        /* ---------- Box editor ---------- */
        <>
          <p className="panel-h panel-h--order">Boxes</p>
          <p className="panel-hint">Drag on the page to draw a box. Drag a box to move it, or its corner to resize.</p>
          <button className="panel-btn" onClick={onAddBlock}>
            + Add box
          </button>

          {selected ? (
            <div className="box-edit">
              <label className="box-edit__field">
                <span>Shows</span>
                <span className="font-select">
                  <select value={selected.content} onChange={(e) => onUpdateBlock(selected.id, { content: e.target.value })}>
                    {contentOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <img src={expandMoreSm} alt="" />
                </span>
              </label>
              {selected.content === 'text' && (
                <textarea
                  className="box-edit__text"
                  rows={3}
                  placeholder="Type text for this box"
                  value={selected.text ?? ''}
                  onChange={(e) => onUpdateBlock(selected.id, { text: e.target.value })}
                />
              )}
              <div className="box-edit__nums">
                {(['x', 'y', 'w', 'h'] as const).map((k) => (
                  <label key={k}>
                    <span>{k.toUpperCase()}</span>
                    <input
                      className="size-box"
                      type="number"
                      inputMode="numeric"
                      value={selected[k]}
                      onChange={(e) => {
                        const n = Number(e.target.value)
                        if (Number.isNaN(n)) return
                        const lim = { x: [0, PAGE_W - selected.w], y: [0, PAGE_H - selected.h], w: [MIN_W, PAGE_W - selected.x], h: [MIN_H, PAGE_H - selected.y] }[k]
                        onUpdateBlock(selected.id, { [k]: clamp(n, lim[0], lim[1]) })
                      }}
                    />
                  </label>
                ))}
              </div>
              <button className="panel-btn panel-btn--danger" onClick={() => onRemoveBlock(selected.id)}>
                Delete box
              </button>
            </div>
          ) : (
            <p className="panel-hint">Tap a box to choose what it shows.</p>
          )}

          <button className="panel-link" onClick={onResetBlocks}>
            Reset layout
          </button>
        </>
      ) : custom ? (
        <p className="panel-hint panel-hint--top">Using your custom layout. Pick a template above to switch back.</p>
      ) : (
        <>
          <p className="panel-h panel-h--order">Section order</p>
          <ul className="order">
            {order.map((id) => {
              const off = hidden.includes(id)
              return (
                <li key={id} className={`order__row${dragging === id ? ' is-dragging' : ''}${off ? ' is-off' : ''}`}>
                  <button
                    className="order__handle"
                    aria-label={`Move ${nameOf(id)} — drag, or use arrow keys`}
                    onPointerDown={(e) => onDown(e, id)}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    onKeyDown={(e) => onKey(e, id)}
                  >
                    <img src={dragIcon} alt="" />
                  </button>
                  <span className="order__name">{nameOf(id)}</span>
                  <button className="order__eye" aria-pressed={!off} aria-label={`${off ? 'Show' : 'Hide'} ${nameOf(id)}`} onClick={() => onHidden(off ? hidden.filter((h) => h !== id) : [...hidden, id])}>
                    {off ? 'Show' : 'Hide'}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
