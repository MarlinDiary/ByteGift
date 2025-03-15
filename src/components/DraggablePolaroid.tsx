"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"

interface DraggablePolaroidProps {
  id: string
  imageUrl: string
  initialPosition: { x: number; y: number }
  zIndex: number
  dateTaken?: string
  onPositionChange: (id: string, position: { x: number; y: number }) => void
  onDragStart: (id: string) => void
}

export const DraggablePolaroid: React.FC<DraggablePolaroidProps> = ({
  id,
  imageUrl,
  initialPosition,
  zIndex,
  dateTaken,
  onPositionChange,
  onDragStart,
}) => {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const polaroidRef = useRef<HTMLDivElement>(null)
  const [rotation] = useState(() => Math.random() * 10 - 5) // Random rotation between -5 and 5 degrees

  // 格式化日期为 YYYY.MM.DD
  const formatDate = (dateString?: string) => {
    try {
      const date = dateString ? new Date(dateString) : new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}.${month}.${day}`
    } catch (error) {
      // 如果日期解析失败，返回当前日期的格式化版本
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const day = String(now.getDate()).padStart(2, "0")
      return `${year}.${month}.${day}`
    }
  }

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (polaroidRef.current) {
      const rect = polaroidRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      onDragStart(id) // 通知父组件开始拖动，更新z-index
    }
  }

  // Handle touch start for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (polaroidRef.current && e.touches[0]) {
      const rect = polaroidRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      })
      setIsDragging(true)
      onDragStart(id) // 通知父组件开始拖动，更新z-index
    }
  }

  // Handle mouse move during dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      }
      setPosition(newPosition)
    }
  }

  // Handle touch move for mobile devices
  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      const newPosition = {
        x: e.touches[0].clientX - dragOffset.x,
        y: e.touches[0].clientY - dragOffset.y,
      }
      setPosition(newPosition)
    }
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      onPositionChange(id, position)
    }
  }

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", handleTouchMove)
      window.addEventListener("touchend", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  return (
    <div
      ref={polaroidRef}
      className={`absolute transition-shadow duration-300 rounded-md overflow-hidden ${isDragging ? "shadow-2xl cursor-grabbing" : "cursor-grab shadow-lg hover:shadow-2xl"
        }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        touchAction: "none",
        zIndex: zIndex, // 使用传入的z-index
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="w-48 h-56 bg-white p-3 border border-stone-200 rounded-md overflow-hidden">
        {/* Photo area with inner shadow */}
        <div className="bg-gray-50 aspect-square overflow-hidden flex items-center justify-center relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] rounded-sm">
          <Image src={imageUrl || "/placeholder.svg"} alt="Polaroid photo" fill className="object-cover rounded-sm" />
          {/* Photo area inner shadow overlay */}
          <div className="absolute inset-0 shadow-[inset_0_0_4px_rgba(0,0,0,0.1)]" />
        </div>

        {/* Bottom area with subtle gradient */}
        <div className="left-0 right-0 h-10 flex items-center justify-center bg-gradient-to-b from-transparent to-white">
          <span className="text-gray-500 select-none font-caveat text-lg">{formatDate(dateTaken)}</span>
        </div>
      </div>
    </div>
  )
}

export default DraggablePolaroid