"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface NoteContentProps {
  color: string
  isDragging?: boolean
  width?: string  // 可选的宽度参数
  height?: string // 可选的高度参数
}

export const NoteContent: React.FC<NoteContentProps> = ({ color, isDragging = false, width, height }) => {
  const [content, setContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [randomSize, setRandomSize] = useState({
    width: "",
    height: ""
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)

  // 组件挂载时生成随机尺寸
  useEffect(() => {
    // 如果外部提供了尺寸，则使用外部尺寸
    if (width && height) {
      setRandomSize({ width, height })
      return
    }

    // 否则生成随机尺寸
    // 宽度在192px到256px之间随机（从w-48到w-64）
    // 高度在192px到256px之间随机（从h-48到h-64）
    const widthOptions = ['w-48', 'w-52', 'w-56', 'w-60', 'w-64'];
    const heightOptions = ['h-48', 'h-52', 'h-56', 'h-60', 'h-64'];

    const randomWidth = widthOptions[Math.floor(Math.random() * widthOptions.length)];
    const randomHeight = heightOptions[Math.floor(Math.random() * heightOptions.length)];

    setRandomSize({
      width: randomWidth,
      height: randomHeight
    });
  }, [width, height]);

  // Get color styles based on the color prop
  const getColorStyles = () => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          tape: "bg-blue-200/70",
          text: "text-blue-800",
        }
      case "green":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          tape: "bg-green-200/70",
          text: "text-green-800",
        }
      case "pink":
        return {
          bg: "bg-pink-50",
          border: "border-pink-200",
          tape: "bg-pink-200/70",
          text: "text-pink-800",
        }
      case "purple":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          tape: "bg-purple-200/70",
          text: "text-purple-800",
        }
      case "amber":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          tape: "bg-amber-200/70",
          text: "text-amber-800",
        }
      default: // yellow
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          tape: "bg-yellow-200/70",
          text: "text-yellow-800",
        }
    }
  }

  const colorStyles = getColorStyles()

  // Handle note click to enter edit mode
  const handleNoteClick = (e: React.MouseEvent) => {
    // If we're already dragging, don't enter edit mode
    if (isDragging) {
      e.stopPropagation()
      return
    }

    // If we're already editing, don't do anything
    if (isEditing) return

    // Enter edit mode
    setIsEditing(true)
    e.stopPropagation()

    // Focus the textarea after a short delay to ensure it's ready
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 10)
  }

  // Handle textarea click to prevent event propagation
  const handleTextareaClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Handle mouse down on textarea to prevent dragging
  const handleTextareaMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Add click outside listener to exit edit mode
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (noteRef.current && !noteRef.current.contains(e.target as Node) && isEditing) {
        setIsEditing(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isEditing])

  // Track dragging state changes
  useEffect(() => {
    if (isDragging) {
      // If we start dragging while editing, exit edit mode
      if (isEditing) {
        setIsEditing(false)
      }
    }
  }, [isDragging])

  return (
    <div
      ref={noteRef}
      className={`transition-shadow duration-300 rounded-md overflow-hidden ${isDragging ? "shadow-2xl" : "shadow-lg hover:shadow-2xl"
        }`}
      onClick={handleNoteClick}
    >
      <div className={`${randomSize.width} ${randomSize.height} ${colorStyles.bg} p-3 border ${colorStyles.border} rounded-md relative`}>
        {/* Note tape effect */}
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-14 h-3 ${colorStyles.tape} rounded-b-sm`}
        />

        {isEditing ? (
          /* Editable textarea when in edit mode */
          <textarea
            ref={textareaRef}
            className={`w-full h-full bg-transparent resize-none outline-none pt-4 font-caveat text-2xl ${colorStyles.text} placeholder:${colorStyles.text} placeholder:opacity-60 scrollbar-hide`}
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onClick={handleTextareaClick}
            onMouseDown={handleTextareaMouseDown}
            style={{
              overflow: "auto",
              fontFamily: "Caveat, cursive"
            }}
          />
        ) : (
          /* Read-only display when not in edit mode */
          <div
            className={`w-full h-full pt-4 font-caveat text-2xl ${colorStyles.text} overflow-auto scrollbar-hide whitespace-pre-wrap`}
            style={{
              overflowWrap: "break-word",
              fontFamily: "Caveat, cursive"
            }}
          >
            {content || <span className="opacity-60">Write something...</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteContent

