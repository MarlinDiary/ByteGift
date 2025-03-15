"use client"

import type React from "react"
import { useRef, useEffect } from "react"

interface DoodleContentProps {
  svgData: string
  isDragging?: boolean
}

export const DoodleContent: React.FC<DoodleContentProps> = ({ svgData, isDragging = false }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      // Insert the SVG data into the container
      containerRef.current.innerHTML = svgData

      // Get the SVG element
      const svg = containerRef.current.querySelector("svg")
      if (svg) {
        // Make sure the SVG preserves aspect ratio and fits within the container
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
        svg.style.display = "block"
        svg.style.maxWidth = "100%"
        svg.style.maxHeight = "100%"
      }
    }
  }, [svgData])

  return <div ref={containerRef} className="min-w-[100px] min-h-[100px]" />
}

export default DoodleContent

