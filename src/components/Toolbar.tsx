"use client"

import React, { useState, useEffect, useRef } from "react"
import { Polaroid } from "./Polaroid"
import { MicrophoneIcon } from "./MicrophoneIcon"
import SpotifyIcon from "./SpotifyIcon"
import PencilIcon from "./PencilIcon"
import { motion, AnimatePresence } from "framer-motion"

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

interface ToolbarProps {
  onAddPhoto: () => void
  onAddNote: (color: string) => void
  onRecordVoice: () => void
  onAddSpotify: (url: string) => void
  onAddDoodle: () => void
  onSaveDoodle: (svgData: string) => void
  isRecording: boolean
  isDoodling?: boolean
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddPhoto,
  onAddNote,
  onRecordVoice,
  onAddSpotify,
  onAddDoodle,
  onSaveDoodle,
  isRecording,
  isDoodling = false,
}) => {
  // 绘画相关状态
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // 画笔颜色
  const colors = ["#000000", "#f87171", "#60a5fa", "#4ade80", "#c084fc", "#fbbf24", "#f472b6"]
  const strokeWidth = 8

  // 可用的便签颜色
  const noteColors = ["yellow", "blue", "green", "pink", "purple", "amber"]

  // 跟踪下三种颜色的状态
  const [colorIndices, setColorIndices] = useState([0, 1, 2])

  // 控制工具是否显示
  const [showTools, setShowTools] = useState(true)

  // 在绘画模式变更时处理工具显示状态
  useEffect(() => {
    if (isDoodling) {
      // 如果进入绘画模式，先隐藏工具
      setShowTools(false)
    } else {
      // 如果退出绘画模式，显示工具
      setShowTools(true)
      // 清空绘画数据
      setStrokes([])
      setCurrentStroke(null)
    }
  }, [isDoodling])

  // 处理便签创建和颜色轮换
  const handleAddNote = () => {
    // 获取当前颜色（队列中的第一个）
    const currentColor = noteColors[colorIndices[0]]

    // 轮换颜色索引
    const newIndices = [
      (colorIndices[0] + 1) % noteColors.length,
      (colorIndices[1] + 1) % noteColors.length,
      (colorIndices[2] + 1) % noteColors.length,
    ]

    // 更新颜色索引
    setColorIndices(newIndices)

    // 使用当前颜色创建便签
    onAddNote(currentColor)
  }

  // 根据颜色名称获取颜色样式
  const getColorStyles = (colorName: string) => {
    switch (colorName) {
      case "blue":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
        }
      case "green":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
        }
      case "pink":
        return {
          bg: "bg-pink-50",
          border: "border-pink-200",
        }
      case "purple":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
        }
      case "amber":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
        }
      default: // yellow
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
        }
    }
  }

  // 获取当前三个便签的颜色样式
  const topNoteStyles = getColorStyles(noteColors[colorIndices[0]])
  const middleNoteStyles = getColorStyles(noteColors[colorIndices[1]])
  const bottomNoteStyles = getColorStyles(noteColors[colorIndices[2]])

  // 工具栏背景动画变量
  const backgroundVariants = {
    initial: { y: 150, opacity: 0 },
    normal: {
      y: 0,
      opacity: 1,
      height: "8rem", // 32px * 4 = 128px 约等于 8rem
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 18,
        delay: 0.05
      }
    },
    expanded: {
      y: 0,
      opacity: 1,
      height: "70vh", // 扩展到视口高度的70%
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        delay: 0.1
      }
    }
  }

  // 工具按钮动画变量
  const toolButtonVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 14,
        delay: 0.15 + custom * 0.06,
      }
    }),
    exit: {
      y: 50,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  }

  // 便签组动画变量
  const noteStackVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 14,
        delay: 0.21,
      }
    },
    exit: {
      y: 50,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  }

  // 绘画功能
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
    if (!isDoodling) return

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
    if (!isDrawing || !currentStroke || !isDoodling) return

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
    if (!currentStroke || !isDoodling) {
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
    // 检查点击事件是否发生在控制按钮或颜色选择器上
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.color-picker')) {
      return;
    }

    if (!isDoodling) return
    e.preventDefault()
    startDrawing(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDoodling) return
    e.preventDefault()
    draw(e.clientX, e.clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDoodling) return
    e.preventDefault()
    endDrawing()
  }

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    // 检查触摸事件是否发生在控制按钮或颜色选择器上
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.color-picker')) {
      return;
    }

    if (!isDoodling) return
    e.preventDefault()
    if (e.touches[0]) {
      startDrawing(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDoodling || !isDrawing) return
    e.preventDefault()
    if (e.touches[0]) {
      draw(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDoodling) return
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
  const handleSaveDoodle = () => {
    // 如果没有笔画，直接退出
    if (strokes.length === 0) {
      // 退出绘画模式但不保存任何内容
      onAddDoodle();
      return;
    }

    try {
      // 计算边界框
      const allPoints = strokes.flatMap(stroke => stroke.points);

      // 再次检查是否有有效的点
      if (allPoints.length === 0) {
        onAddDoodle();
        return;
      }

      // 找出最小和最大坐标
      const xValues = allPoints.map(p => p.x);
      const yValues = allPoints.map(p => p.y);

      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);

      // 添加一些内边距
      const padding = 20;
      const viewMinX = Math.max(0, minX - padding);
      const viewMinY = Math.max(0, minY - padding);
      const viewWidth = Math.max(50, maxX - minX + 2 * padding);
      const viewHeight = Math.max(50, maxY - minY + 2 * padding);

      // 创建SVG内容
      const svgContent = `
        <svg width="${viewWidth}" height="${viewHeight}" viewBox="${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}" xmlns="http://www.w3.org/2000/svg">
          ${strokes.map(stroke => {
        if (stroke.type === 'dot') {
          // 绘制点
          const point = stroke.points[0];
          return `
                <circle
                  cx="${point.x}"
                  cy="${point.y}"
                  r="${stroke.width / 2}"
                  fill="${stroke.color}"
                />
              `;
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
              `;
        }
      }).join('')}
        </svg>
      `;

      // 保存SVG数据
      onSaveDoodle(svgContent);
    } catch (error) {
      console.error('Error saving doodle:', error);
      // 出错时也要退出绘画模式
      onAddDoodle();
    }
  };

  // 取消绘制
  const handleCancelDoodle = () => {
    // 清空所有绘画数据
    setStrokes([]);
    setCurrentStroke(null);

    // 退出绘画模式
    onAddDoodle();
  };

  // 清除画布
  const clearCanvas = () => {
    setStrokes([])
    setCurrentStroke(null)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-4xl px-4 z-10">
      {/* 背景层 - 可以作为画布 */}
      <motion.div
        className={`relative rounded-t-2xl border-2 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] bg-white/20 backdrop-blur-md ${isDoodling ? 'cursor-crosshair' : ''}`}
        variants={backgroundVariants}
        initial="initial"
        animate={isDoodling ? "expanded" : "normal"}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 绘画画布 */}
        {isDoodling && (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
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

            {/* 绘画工具 UI */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-4 flex justify-center items-center p-2 gap-3 bg-white rounded-full shadow-lg border border-gray-100 z-10 color-picker">
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
              onClick={handleCancelDoodle}
              aria-label="取消涂鸦"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* 保存按钮 */}
            <button
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow hover:bg-blue-600 transition-colors z-10"
              onClick={handleSaveDoodle}
              aria-label="保存涂鸦"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* 清除画布按钮 */}
            <button
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 shadow hover:bg-gray-300 transition-colors z-10"
              onClick={clearCanvas}
              aria-label="清除画布"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </motion.div>

      {/* 工具层 - 与背景分离 */}
      <AnimatePresence>
        {showTools && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 w-full px-8 h-32 flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {/* 拍立得组件 */}
            <motion.div
              custom={0}
              variants={toolButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Polaroid onClick={onAddPhoto} />
            </motion.div>

            {/* 三层堆叠便签组件 */}
            <motion.div
              variants={noteStackVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div
                className="group z-10 transform translate-y-2 transition-all duration-300 ease-in-out hover:-translate-y-12 hover:scale-110 relative w-32 h-40 cursor-pointer"
                onClick={handleAddNote}
              >
                {/* 底层便签（堆叠中的第三个） */}
                <div
                  className={`absolute inset-0 ${bottomNoteStyles.bg} ${bottomNoteStyles.border} shadow-md rounded-sm border transform rotate-12 group-hover:rotate-32 group-hover:translate-x-2 group-hover:translate-y-2 group-hover:shadow-xl transition-all duration-500 z-10`}
                  style={{ transition: "background-color 0.5s, border-color 0.5s, transform 0.5s, box-shadow 0.5s" }}
                />

                {/* 中层便签（堆叠中的第二个） */}
                <div
                  className={`absolute inset-0 ${middleNoteStyles.bg} ${middleNoteStyles.border} shadow-md rounded-sm border transform rotate-0 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-500 z-20`}
                  style={{ transition: "background-color 0.5s, border-color 0.5s, transform 0.5s, box-shadow 0.5s" }}
                />

                {/* 顶层便签（堆叠中的第一个） */}
                <div
                  className={`absolute inset-0 ${topNoteStyles.bg} ${topNoteStyles.border} shadow-md rounded-sm border transform -rotate-12 group-hover:-rotate-24 group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-500 z-30`}
                  style={{ transition: "background-color 0.5s, border-color 0.5s, transform 0.5s, box-shadow 0.5s" }}
                />

                {/* 用于更好点击处理的不可见按钮 */}
                <button
                  type="button"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-40"
                  aria-label="添加便签"
                ></button>
              </div>
            </motion.div>

            {/* 麦克风图标 */}
            <motion.div
              custom={2}
              variants={toolButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <MicrophoneIcon isRecording={isRecording} onClick={onRecordVoice} />
            </motion.div>

            {/* Spotify CD图标 */}
            <motion.div
              custom={3}
              variants={toolButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <SpotifyIcon onAddSpotify={onAddSpotify} />
            </motion.div>

            {/* Pencil Icon */}
            <motion.div
              custom={4}
              variants={toolButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <PencilIcon onClick={() => {
                // 清空所有绘画数据
                setStrokes([]);
                setCurrentStroke(null);
                // 触发绘画模式
                onAddDoodle();
              }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

