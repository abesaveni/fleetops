/**
 * Trackitlio brand logo — recreated as inline SVG.
 *
 * Structure:
 *   - Dark-navy (#0f2744) gear wheel, 16 teeth
 *   - Teal (#0da898) T-arrow symbol inside:
 *       • Wide crossbar across the top
 *       • LEFT end: line curves into a downward hook → left-pointing arrowhead (↩ ←)
 *       • RIGHT end: crossbar terminates at the top of the right stem
 *       • Left stem drops from T-junction → symmetric U with proper semicircle bottom
 *       • Right stem rises through the crossbar → upward arrowhead (↑) above it
 */

function gearPath(cx: number, cy: number, ro: number, ri: number, n: number): string {
  const step = (Math.PI * 2) / n
  const ta = step * 0.22   // tooth half-angle
  const tr = step * 0.065  // transition slope
  const f = (r: number, a: number) =>
    `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  let d = ''
  for (let i = 0; i < n; i++) {
    const b = i * step - Math.PI / 2
    const a1 = b - ta - tr, a2 = b - ta, a3 = b + ta, a4 = b + ta + tr
    if (i === 0) d += `M${f(ri, a1)}`
    else d += `A${ri},${ri},0,0,1,${f(ri, a1)}`
    d += `L${f(ro, a2)}A${ro},${ro},0,0,1,${f(ro, a3)}L${f(ri, a4)}`
  }
  return d + `A${ri},${ri},0,0,1,${f(ri, -Math.PI / 2 - ta - tr)}Z`
}

const TEAL  = '#0da898'
const NAVY  = '#0f2744'
const SW    = 5      // main stroke width (in 100×100 viewBox)
const ASW   = 4.5   // arrowhead stroke width

export function LogoMark({ size = 48 }: { size?: number }) {
  const gear = gearPath(50, 50, 48, 36, 16)

  // ── T-arrow symbol coordinates ──────────────────────────────────────────
  // Crossbar y-level
  const cy = 36
  // Left hook: crossbar extends left to xHook, then arcs down to xHook,yHookEnd
  const xHook = 29, yHookEnd = 46, hookR = 5
  // T junction (where left stem meets crossbar)
  const xL = 40
  // Right stem x (also = right end of crossbar)
  const xR = 60
  // Bottom of U (stems go down to this y, then semicircle connects them)
  const yBot = 60
  // Top of upward arrow (above crossbar)
  const yArrowTip = 28
  // Arrow wing offsets
  const awX = 6, awY = 7

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ── Gear ── */}
      <path d={gear} fill={NAVY} />
      {/* White inner circle — creates the hollow gear center */}
      <circle cx="50" cy="50" r="28" fill="white" />

      {/* ── Crossbar: full horizontal span from hook-start to right stem ── */}
      <line
        x1={xHook} y1={cy} x2={xR} y2={cy}
        stroke={TEAL} strokeWidth={SW} strokeLinecap="round"
      />

      {/* ── Left hook arc: from hook-start curves CCW (left→down) ──────── */}
      {/* Arc: M(xHook,cy) → CCW semicircle of radius hookR → (xHook, cy+2*hookR) */}
      {/* This creates a fishhook that swings LEFT then ends pointing LEFT */}
      <path
        d={`M${xHook},${cy} A${hookR},${hookR},0,0,0,${xHook},${yHookEnd}`}
        stroke={TEAL} strokeWidth={SW} fill="none" strokeLinecap="round"
      />

      {/* ── Left arrowhead at hook tip, pointing LEFT ← ─────────────────── */}
      <polyline
        points={`${xHook + 5},${yHookEnd - 4} ${xHook},${yHookEnd} ${xHook + 5},${yHookEnd + 4}`}
        stroke={TEAL} strokeWidth={ASW} fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />

      {/* ── Small filled dot at right-end junction (crossbar meets right stem) */}
      <circle cx={xR} cy={cy} r="3" fill={TEAL} />

      {/* ── Left stem: T junction down to U bottom ──────────────────────── */}
      <line
        x1={xL} y1={cy} x2={xL} y2={yBot}
        stroke={TEAL} strokeWidth={SW} strokeLinecap="round"
      />

      {/* ── U bottom: proper semicircle from left stem to right stem ─────── */}
      {/* A(rx,ry,x-rot,large-arc,sweep,ex,ey): CCW arc goes DOWN through bottom */}
      <path
        d={`M${xL},${yBot} A${(xR - xL) / 2},${(xR - xL) / 2},0,0,0,${xR},${yBot}`}
        stroke={TEAL} strokeWidth={SW} fill="none" strokeLinecap="round"
      />

      {/* ── Right stem: U bottom up through crossbar to arrow tip ────────── */}
      <line
        x1={xR} y1={yBot} x2={xR} y2={yArrowTip}
        stroke={TEAL} strokeWidth={SW} strokeLinecap="round"
      />

      {/* ── Upward arrowhead at right stem top, pointing UP ↑ ──────────── */}
      <polyline
        points={`${xR - awX},${yArrowTip + awY} ${xR},${yArrowTip} ${xR + awX},${yArrowTip + awY}`}
        stroke={TEAL} strokeWidth={ASW} fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

/** Horizontal: icon + "Trackitlio" text (+ optional tagline) */
export function LogoFull({
  size = 40,
  showTagline = false,
  darkBg = false,
}: {
  size?: number
  showTagline?: boolean
  darkBg?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <div>
        <div style={{
          fontSize: size * 0.44,
          fontWeight: 800,
          color: darkBg ? '#f1f5f9' : NAVY,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          fontFamily: 'inherit',
        }}>
          Trackitlio
        </div>
        {showTagline && (
          <div style={{
            fontSize: size * 0.2,
            fontWeight: 700,
            color: TEAL,
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
            marginTop: 3,
            lineHeight: 1,
          }}>
            From Issue to Resolution
          </div>
        )}
      </div>
    </div>
  )
}

/** Vertical (stacked): icon above text — used on login / signup */
export function LogoStacked({ size = 64 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <LogoMark size={size} />
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: size * 0.38,
          fontWeight: 800,
          color: NAVY,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          Trackitlio
        </div>
        <div style={{
          fontSize: size * 0.165,
          fontWeight: 700,
          color: TEAL,
          letterSpacing: '0.07em',
          textTransform: 'uppercase' as const,
          marginTop: 5,
          lineHeight: 1,
        }}>
          From Issue to Resolution
        </div>
      </div>
    </div>
  )
}

export default LogoFull
