import React from "react";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants";

export default function PieChart({ categoryTotals }) {
  const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  let cumulativePercent = 0;
  const slices = Object.entries(categoryTotals).map(([cat, value]) => {
    const percent = value / total;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return { cat, value, percent, start };
  });

  function getCoords(percent) {
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    return { x: 50 + 40 * Math.cos(angle), y: 50 + 40 * Math.sin(angle) };
  }

  return (
    <div className="pie-wrapper">
      <svg viewBox="0 0 100 100" className="pie-svg">
        {slices.map(({ cat, percent, start }) => {
          if (percent === 0) return null;
          const s = getCoords(start);
          const e = getCoords(start + percent);
          const large = percent > 0.5 ? 1 : 0;
          return (
            <path key={cat}
              d={`M50,50 L${s.x},${s.y} A40,40 0 ${large},1 ${e.x},${e.y} Z`}
              fill={CATEGORY_COLORS[cat]} opacity="0.85" />
          );
        })}
        <circle cx="50" cy="50" r="22" fill="#0f172a" />
        <text x="50" y="47" textAnchor="middle" fill="#94a3b8" fontSize="6">Total</text>
        <text x="50" y="56" textAnchor="middle" fill="#f1f5f9" fontSize="7" fontWeight="bold">
          ₹{total.toLocaleString()}
        </text>
      </svg>
      <div className="pie-legend">
        {slices.map(({ cat, value, percent }) => (
          <div key={cat} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
            <span className="legend-cat">{CATEGORY_ICONS[cat]} {cat}</span>
            <span className="legend-pct">{Math.round(percent * 100)}%</span>
            <span className="legend-val">₹{value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}