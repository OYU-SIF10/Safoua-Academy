// ─────────────────────────────────────────────────────────────────────────────
// ProgressCircle — cercle SVG animé de progression
//
// Props :
//   value  : number (0-100)
//   size   : 'sm' | 'md' | 'lg' (défaut: 'md')
//   color  : string hex (défaut: '#1a7a4a')
//   label  : string optionnel sous le %
// ─────────────────────────────────────────────────────────────────────────────

const sizes = {
  sm: { svg: 'w-16 h-16', r: 24, strokeWidth: 6, text: 'text-sm' },
  md: { svg: 'w-28 h-28', r: 40, strokeWidth: 10, text: 'text-2xl' },
  lg: { svg: 'w-40 h-40', r: 58, strokeWidth: 12, text: 'text-4xl' },
};

const ProgressCircle = ({
  value = 0,
  size = 'md',
  color = '#1a7a4a',
  label,
}) => {
  const { svg, r, strokeWidth, text } = sizes[size] || sizes.md;
  const circ = 2 * Math.PI * r;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circ - (clampedValue / 100) * circ;
  const center = r + strokeWidth;
  const viewBox = `0 0 ${center * 2} ${center * 2}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${svg} flex items-center justify-center`}>
        <svg className={`${svg} -rotate-90`} viewBox={viewBox}>
          {/* Fond */}
          <circle
            cx={center} cy={center} r={r}
            fill="none" stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progression */}
          <circle
            cx={center} cy={center} r={r}
            fill="none" stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        {/* Texte centré */}
        <div className="absolute flex flex-col items-center">
          <span className={`${text} font-extrabold leading-none`} style={{ color }}>
            {clampedValue}%
          </span>
        </div>
      </div>
      {label && <p className="text-xs text-gray-400 text-center">{label}</p>}
    </div>
  );
};

export default ProgressCircle;