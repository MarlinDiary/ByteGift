"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"

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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const itemRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef(initialPosition)
  const dragStartPosRef = useRef({ x: 0, y: 0 })
  const hasDraggedRef = useRef(false)

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Skip if the target is a textarea or input
    if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
      return
    }

    if (itemRef.current) {
      e.preventDefault()
      const rect = itemRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })

      // Record the starting position of the drag
      dragStartPosRef.current = { x: e.clientX, y: e.clientY }
      hasDraggedRef.current = false

      setIsDragging(true)
      onDragStart(id)
    }
  }

  // Handle touch start for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    // Skip if the target is a textarea or input
    if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
      return
    }

    if (itemRef.current && e.touches[0]) {
      const rect = itemRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      })

      // Record the starting position of the drag
      dragStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      hasDraggedRef.current = false

      setIsDragging(true)
      onDragStart(id)
    }
  }

  // Handle mouse move during dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Check if we've moved enough to consider this a drag
      const dx = Math.abs(e.clientX - dragStartPosRef.current.x)
      const dy = Math.abs(e.clientY - dragStartPosRef.current.y)
      if (dx > 5 || dy > 5) {
        hasDraggedRef.current = true
      }

      positionRef.current = { x: newX, y: newY }

      // Use requestAnimationFrame for smooth animation
      requestAnimationFrame(() => {
        if (itemRef.current) {
          itemRef.current.style.left = `${newX}px`
          itemRef.current.style.top = `${newY}px`
        }
      })
    }
  }

  // Handle touch move for mobile devices
  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      const newX = e.touches[0].clientX - dragOffset.x
      const newY = e.touches[0].clientY - dragOffset.y

      // Check if we've moved enough to consider this a drag
      const dx = Math.abs(e.touches[0].clientX - dragStartPosRef.current.x)
      const dy = Math.abs(e.touches[0].clientY - dragStartPosRef.current.y)
      if (dx > 5 || dy > 5) {
        hasDraggedRef.current = true
      }

      positionRef.current = { x: newX, y: newY }

      // Use requestAnimationFrame for smooth animation
      requestAnimationFrame(() => {
        if (itemRef.current) {
          itemRef.current.style.left = `${newX}px`
          itemRef.current.style.top = `${newY}px`
        }
      })
    }
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false)
      onPositionChange(id, positionRef.current)

      // If this was a drag (not just a click), prevent the subsequent click event
      if (hasDraggedRef.current) {
        // Add a small delay to prevent the click event
        setTimeout(() => {
          hasDraggedRef.current = false
        }, 10)

        // Add a one-time click event listener to prevent the next click
        const preventNextClick = (e: MouseEvent) => {
          e.stopPropagation()
          window.removeEventListener("click", preventNextClick, true)
        }
        window.addEventListener("click", preventNextClick, true)
      }
    }
  }

  // Handle touch end
  const handleTouchEnd = (e: TouchEvent) => {
    if (isDragging) {
      setIsDragging(false)
      onPositionChange(id, positionRef.current)

      // If this was a drag (not just a tap), prevent the subsequent click event
      if (hasDraggedRef.current) {
        setTimeout(() => {
          hasDraggedRef.current = false
        }, 10)
      }
    }
  }

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", handleTouchMove)
      window.addEventListener("touchend", handleTouchEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, dragOffset])

  useEffect(() => {
    if (itemRef.current) {
      itemRef.current.style.left = `${initialPosition.x}px`
      itemRef.current.style.top = `${initialPosition.y}px`
    }
  }, [])

  // Clone children and pass isDragging prop
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isDragging: isDragging } as { isDragging: boolean })
    }
    return child
  })

  return (
    <div
      ref={itemRef}
      className={`absolute ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: `${initialPosition.x}px`,
        top: `${initialPosition.y}px`,
        transform: `rotate(${rotation}deg)`,
        touchAction: "none",
        zIndex: zIndex,
        willChange: "transform, left, top",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        // If we just finished dragging, prevent the click
        if (hasDraggedRef.current) {
          e.stopPropagation()
          e.preventDefault()
        }
      }}
    >
      {childrenWithProps}
    </div>
  )
}

export default DraggableItem

