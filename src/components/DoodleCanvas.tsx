"use client"

import React, { useState, useRef, useEffect } from "react"

interface DoodleCanvasProps {
  onSave: (svgData: string) => void
  onCancel: () => void
}

interface Point {
  x: number
  y: number
}

interface Stroke {
  type: 'line' | 'dot'
  points: Point[]
  color: string
  width: number
}

export const DoodleCanvas: React.FC<DoodleCanvasProps> = ({ onSave, onCancel }) => {
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // 更现代的颜色方案
  const colors = ["#000000", "#f87171", "#60a5fa", "#4ade80", "#c084fc", "#fbbf24", "#f472b6"]
  const strokeWidth = 8

  // 清除画布
  const clearCanvas = () => {
    setStrokes([])
    setCurrentStroke(null)
  }

  // 获取相对于画布的坐标
  const getCoordinates = (clientX: number, clientY: number): Point | null => {
    if (!canvasRef.current) return null

    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  // 开始绘制
  const startDrawing = (clientX: number, clientY: number) => {
    const point = getCoordinates(clientX, clientY)
    if (!point) return

    // 创建新的笔画
    const newStroke: Stroke = {
      type: 'line', // 默认为线条类型
      points: [point],
      color: selectedColor,
      width: strokeWidth
    }

    setCurrentStroke(newStroke)
    setIsDrawing(true)
  }

  // 绘制过程
  const draw = (clientX: number, clientY: number) => {
    if (!isDrawing || !currentStroke) return

    const point = getCoordinates(clientX, clientY)
    if (!point) return

    // 添加点到当前笔画
    setCurrentStroke({
      ...currentStroke,
      points: [...currentStroke.points, point]
    })
  }

  // 结束绘制
  const endDrawing = () => {
    if (!currentStroke) {
      setIsDrawing(false)
      return
    }

    // 判断是点还是线
    let finalStroke: Stroke

    if (currentStroke.points.length === 1) {
      // 如果只有一个点，标记为点类型
      finalStroke = {
        ...currentStroke,
        type: 'dot'
      }
    } else {
      finalStroke = currentStroke
    }

    // 添加到笔画数组
    setStrokes([...strokes, finalStroke])
    setCurrentStroke(null)
    setIsDrawing(false)
  }

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    startDrawing(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault()
    draw(e.clientX, e.clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    endDrawing()
  }

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches[0]) {
      startDrawing(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches[0]) {
      draw(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    endDrawing()
  }

  // 渲染线条的SVG路径
  const renderPath = (stroke: Stroke) => {
    if (stroke.points.length < 2) return ""

    const start = stroke.points[0]
    let path = `M ${start.x} ${start.y}`

    for (let i = 1; i < stroke.points.length; i++) {
      path += ` L ${stroke.points[i].x} ${stroke.points[i].y}`
    }

    return path
  }

  // 保存绘图为SVG
  const handleSave = () => {
    if (strokes.length === 0) {
      onCancel()
      return
    }

    // 计算边界框
    const allPoints = strokes.flatMap(stroke => stroke.points)
    if (allPoints.length === 0) {
      onCancel()
      return
    }

    // 找出最小和最大坐标
    const xValues = allPoints.map(p => p.x)
    const yValues = allPoints.map(p => p.y)

    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    const minY = Math.min(...yValues)
    const maxY = Math.max(...yValues)

    // 添加一些内边距
    const padding = 20
    const viewMinX = Math.max(0, minX - padding)
    const viewMinY = Math.max(0, minY - padding)
    const viewWidth = Math.max(50, maxX - minX + 2 * padding)
    const viewHeight = Math.max(50, maxY - minY + 2 * padding)

    // 创建SVG内容
    const svgContent = `
      <svg width="${viewWidth}" height="${viewHeight}" viewBox="${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}" xmlns="http://www.w3.org/2000/svg">
        ${strokes.map(stroke => {
      if (stroke.type === 'dot') {
        // 绘制点
        const point = stroke.points[0]
        return `
              <circle
                cx="${point.x}"
                cy="${point.y}"
                r="${stroke.width / 2}"
                fill="${stroke.color}"
              />
            `
      } else {
        // 绘制线条
        return `
              <path
                d="${renderPath(stroke)}"
                stroke="${stroke.color}"
                stroke-width="${stroke.width}"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
              />
            `
      }
    }).join('')}
      </svg>
    `

    onSave(svgContent)
  }

  // 阻止默认的触摸行为（防止滚动等）
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const preventDefault = (e: Event) => {
      e.preventDefault()
    }

    canvas.addEventListener('touchstart', preventDefault, { passive: false })
    canvas.addEventListener('touchmove', preventDefault, { passive: false })
    canvas.addEventListener('touchend', preventDefault, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', preventDefault)
      canvas.removeEventListener('touchmove', preventDefault)
      canvas.removeEventListener('touchend', preventDefault)
    }
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-4xl px-4 animate-slide-up z-50">
      <div className="relative h-64 rounded-t-2xl flex flex-col border border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] bg-white">
        {/* 绘图区域 */}
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
            {/* 已完成的笔画 */}
            {strokes.map((stroke, index) => (
              <React.Fragment key={index}>
                {stroke.type === 'dot' ? (
                  <circle
                    cx={stroke.points[0].x}
                    cy={stroke.points[0].y}
                    r={stroke.width / 2}
                    fill={stroke.color}
                  />
                ) : (
                  <path
                    d={renderPath(stroke)}
                    stroke={stroke.color}
                    strokeWidth={stroke.width}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </React.Fragment>
            ))}

            {/* 当前正在绘制的笔画 */}
            {currentStroke && (
              <React.Fragment>
                {currentStroke.points.length === 1 ? (
                  <circle
                    cx={currentStroke.points[0].x}
                    cy={currentStroke.points[0].y}
                    r={currentStroke.width / 2}
                    fill={currentStroke.color}
                  />
                ) : (
                  <path
                    d={renderPath(currentStroke)}
                    stroke={currentStroke.color}
                    strokeWidth={currentStroke.width}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </React.Fragment>
            )}
          </svg>
        </div>

        {/* 颜色选择器 */}
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
              aria-label={`选择${color}颜色`}
            />
          ))}
        </div>

        {/* 清除按钮 */}
        <button
          className="absolute bottom-6 left-6 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 shadow hover:bg-gray-300 transition-colors z-10"
          onClick={onCancel}
          aria-label="取消涂鸦"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* 保存按钮 */}
        <button
          className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow hover:bg-blue-600 transition-colors z-10"
          onClick={handleSave}
          aria-label="保存涂鸦"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default DoodleCanvas

