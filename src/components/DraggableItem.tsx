"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion"

interface DraggableItemProps {
  id: string
  initialPosition: { x: number; y: number }
  zIndex: number
  onPositionChange: (id: string, position: { x: number; y: number }) => void
  onDragStart: (id: string) => void
  children: React.ReactNode
  rotation?: number
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  initialPosition,
  zIndex,
  onPositionChange,
  onDragStart,
  children,
  rotation = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(initialPosition.x)
  const y = useMotionValue(initialPosition.y)
  const hasDraggedRef = useRef(false)
  const currentZIndexRef = useRef(zIndex)

  // 当组件挂载时设置初始位置
  useEffect(() => {
    x.set(initialPosition.x)
    y.set(initialPosition.y)
  }, [initialPosition.x, initialPosition.y])

  // 当 zIndex 属性变化时更新 ref
  useEffect(() => {
    currentZIndexRef.current = zIndex
  }, [zIndex])

  // 处理拖拽开始
  const handleDragStart = () => {
    setIsDragging(true)
    onDragStart(id)
    hasDraggedRef.current = false
  }

  // 处理拖拽结束
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const newPosition = { x: x.get(), y: y.get() }
    onPositionChange(id, newPosition)

    // 如果拖动距离超过阈值，则视为拖拽而非点击
    if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
      hasDraggedRef.current = true

      // 添加短暂延迟以防止后续点击事件
      setTimeout(() => {
        hasDraggedRef.current = false
      }, 100)
    }
  }

  // 处理点击事件，将元素提升到最高层级
  const handleClick = (e: React.MouseEvent) => {
    // 如果刚结束拖拽，则阻止点击
    if (hasDraggedRef.current) {
      e.stopPropagation()
      e.preventDefault()
      return
    }

    // 触发onDragStart回调以通知父组件该元素应该提升到最高层级
    onDragStart(id)
  }

  // 克隆子组件并传递 isDragging 属性
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isDragging } as { isDragging: boolean })
    }
    return child
  })

  return (
    <motion.div
      style={{
        x,
        y,
        // 直接使用父组件传递的zIndex，在拖拽时临时提高一点层级以确保视觉效果
        zIndex: isDragging ? zIndex + 0.1 : zIndex,
        rotate: rotation,
        cursor: isDragging ? "grabbing" : "grab",
        position: "absolute",
        touchAction: "none"
      }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{
        scale: 1.02,
        transition: { duration: 0.1 }
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      transition={{
        type: "spring",
        damping: 40,
        stiffness: 400
      }}
    >
      {childrenWithProps}
    </motion.div>
  )
}

export default DraggableItem

