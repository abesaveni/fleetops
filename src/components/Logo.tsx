/**
 * Trackitlio brand logo — recreated as inline SVG to match the official logo:
 * dark-navy gear wheel + teal T-arrow (issue-to-resolution tracking symbol).
 */

function gearPath(cx: number, cy: number, ro: number, ri: number, n: number): string {
  const step = (Math.PI * 2) / n
  const ta = step * 0.22   // tooth half-angle (44% of pitch = tooth width)
  const tr = step * 0.06   // transition slope (12% of pitch total)
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

/** Just the gear+arrow icon mark */
export function LogoMark({ size = 48 }: { size?: number }) {
  const gear = gearPath(50, 50, 48, 36, 16)
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gear body — dark navy */}
      <path d={gear} fill="#0f2744" />
      {/* White inner circle */}
      <circle cx="50" cy="50" r="27" fill="white" />

      {/* ── T-arrow tracking symbol ── */}
      {/* Horizontal crossbar */}
      <line x1="26" y1="38" x2="63" y2="38" stroke="#0d9488" strokeWidth="4.2" strokeLinecap="round" />
      {/* Left arrowhead (← issue enters) */}
      <polyline points="32,33 26,38 32,43" stroke="#0d9488" strokeWidth="3.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Left side of U (T stem going down) */}
      <line x1="40" y1="38" x2="40" y2="59" stroke="#0d9488" strokeWidth="4.2" strokeLinecap="round" />
      {/* Bottom curve of U */}
      <path d="M40,59 Q51.5,68 63,59" stroke="#0d9488" strokeWidth="4.2" fill="none" strokeLinecap="round" />
      {/* Right side of U + continues up past crossbar for upward arrow */}
      <line x1="63" y1="59" x2="63" y2="29" stroke="#0d9488" strokeWidth="4.2" strokeLinecap="round" />
      {/* Upward arrowhead (↑ resolved) */}
      <polyline points="57,35 63,29 69,35" stroke="#0d9488" strokeWidth="3.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
          color: darkBg ? '#f1f5f9' : '#0f2744',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          fontFamily: 'inherit',
        }}>
          Trackitlio
        </div>
        {showTagline && (
          <div style={{
            fontSize: size * 0.21,
            fontWeight: 700,
            color: '#0d9488',
            letterSpacing: '0.07em',
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
          color: '#0f2744',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          Trackitlio
        </div>
        <div style={{
          fontSize: size * 0.17,
          fontWeight: 600,
          color: '#0d9488',
          letterSpacing: '0.06em',
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
