"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Check } from "lucide-react"

interface Point {
  x: number
  y: number
}

interface Line {
  points: Point[]
  color: string
  width: number
}

interface DoodleCanvasProps {
  onSave: (svgData: string) => void
  onCancel: () => void
}

export const DoodleCanvas: React.FC<DoodleCanvasProps> = ({ onSave, onCancel }) => {
  const [lines, setLines] = useState<Line[]>([])
  const [currentLine, setCurrentLine] = useState<Line | null>(null)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Available colors
  const colors = ["#000000", "#e53e3e", "#3182ce", "#38a169", "#805ad5"]

  // Start drawing
  const startDrawing = (x: number, y: number) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const newLine: Line = {
      points: [{ x: x - rect.left, y: y - rect.top }],
      color: selectedColor,
      width: 6,
    }

    setCurrentLine(newLine)
    setIsDrawing(true)
  }

  // Continue drawing
  const draw = (x: number, y: number) => {
    if (!isDrawing || !currentLine || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const newPoint = { x: x - rect.left, y: y - rect.top }

    setCurrentLine({
      ...currentLine,
      points: [...currentLine.points, newPoint],
    })
  }

  // Stop drawing
  const stopDrawing = () => {
    if (currentLine) {
      setLines([...lines, currentLine])
      setCurrentLine(null)
    }
    setIsDrawing(false)
  }

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    startDrawing(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    draw(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    stopDrawing()
  }

  // Handle touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      startDrawing(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      draw(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchEnd = () => {
    stopDrawing()
  }

  // Generate SVG path from points
  const generatePath = (line: Line) => {
    if (line.points.length < 2) return ""

    const start = line.points[0]
    let path = `M ${start.x} ${start.y}`

    for (let i = 1; i < line.points.length; i++) {
      path += ` L ${line.points[i].x} ${line.points[i].y}`
    }

    return path
  }

  // Save the drawing
  const handleSave = () => {
    if (svgRef.current && (lines.length > 0 || (currentLine && currentLine.points.length > 0))) {
      // If there's a current line being drawn, add it to lines
      const allLines = currentLine ? [...lines, currentLine] : lines

      // Calculate the bounding box of all drawn lines
      let minX = Number.POSITIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY

      allLines.forEach((line) => {
        line.points.forEach((point) => {
          minX = Math.min(minX, point.x)
          minY = Math.min(minY, point.y)
          maxX = Math.max(maxX, point.x)
          maxY = Math.max(maxY, point.y)
        })
      })

      // Add some padding
      const padding = 10
      minX = Math.max(0, minX - padding)
      minY = Math.max(0, minY - padding)
      maxX = maxX + padding
      maxY = maxY + padding

      // Calculate width and height
      const width = Math.max(50, maxX - minX)
      const height = Math.max(50, maxY - minY)

      // Create a new SVG with the calculated viewBox
      const svgContent = `
        <svg width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          ${allLines
            .map(
              (line) => `
            <path 
              d="${generatePath(line)}" 
              stroke="${line.color}" 
              strokeWidth="${line.width}" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          `,
            )
            .join("")}
        </svg>
      `

      // Call the onSave callback with the SVG data
      onSave(svgContent)
    } else {
      // If nothing was drawn, just cancel
      onCancel()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-4xl px-4 animate-slide-up">
      <div className="relative h-64 rounded-t-2xl flex flex-col border-2 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] bg-white/20 backdrop-blur-md">
        {/* Color picker */}
        <div className="flex justify-center items-center p-2 gap-4">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full transition-transform ${
                selectedColor === color ? "scale-125 ring-2 ring-white shadow-lg" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              aria-label={`Select ${color} color`}
            />
          ))}
        </div>

        {/* Drawing canvas */}
        <div
          ref={canvasRef}
          className="flex-1 bg-white/50 rounded-lg mx-4 mb-4 overflow-hidden cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <svg ref={svgRef} width="100%" height="100%" className="w-full h-full">
            {/* Render completed lines */}
            {lines.map((line, index) => (
              <path
                key={index}
                d={generatePath(line)}
                stroke={line.color}
                strokeWidth={line.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Render current line being drawn */}
            {currentLine && (
              <path
                d={generatePath(currentLine)}
                stroke={currentLine.color}
                strokeWidth={currentLine.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>

        {/* Save button */}
        <button
          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors"
          onClick={handleSave}
          aria-label="Save doodle"
        >
          <Check size={24} />
        </button>
      </div>
    </div>
  )
}

export default DoodleCanvas

