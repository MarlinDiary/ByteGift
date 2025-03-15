"use client"

import type React from "react"

export const GridBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 text-stone-300" style={{ backgroundColor: "#F8F8F7" }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="gridPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 50 0" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.7" />
            <path d="M 0 0 L 0 50" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridPattern)" />
      </svg>
    </div>
  )
}

export default GridBackground

