"use client"

import type React from "react"

import { useState, useRef } from "react"
import { CheckCircle } from "lucide-react"

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

  // Available colors - 更现代的颜色方案
  const colors = ["#000000", "#f87171", "#60a5fa", "#4ade80", "#c084fc", "#fbbf24", "#f472b6"]

  // Start drawing
  const startDrawing = (x: number, y: number) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const newLine: Line = {
      points: [{ x: x - rect.left, y: y - rect.top }],
      color: selectedColor,
      width: 8,
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
      const padding = 20
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
              vectorEffect="non-scaling-stroke"
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
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-4xl px-4 animate-slide-up z-50">
      <div className="relative h-64 rounded-t-2xl flex flex-col border border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] bg-white">
        {/* Drawing canvas - 现在占据整个容器 */}
        <div
          ref={canvasRef}
          className="flex-1 bg-white rounded-t-2xl overflow-hidden cursor-crosshair shadow-inner"
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
                vectorEffect="non-scaling-stroke"
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
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        </div>

        {/* 悬浮的颜色选择器 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-4 flex justify-center items-center p-2 gap-3 bg-white rounded-full shadow-lg border border-gray-100 z-10">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-7 h-7 rounded-full transition-colors duration-150 ${selectedColor === color
                ? "border-2 border-white outline outline-2 outline-gray-400"
                : "hover:opacity-90"
                }`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              aria-label={`Select ${color} color`}
            />
          ))}
        </div>

        {/* Save button - 简化设计 */}
        <button
          className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow hover:bg-blue-600 transition-colors z-10"
          onClick={handleSave}
          aria-label="Save doodle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Cancel button - 调整到左下角 */}
        <button
          className="absolute bottom-6 left-6 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 shadow hover:bg-gray-300 transition-colors z-10"
          onClick={onCancel}
          aria-label="Cancel doodle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default DoodleCanvas

