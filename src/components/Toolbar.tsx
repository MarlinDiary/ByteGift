"use client"

import type React from "react"
import { useState } from "react"
import { Polaroid } from "./Polaroid"
import { MicrophoneIcon } from "./MicrophoneIcon"
import SpotifyIcon from "./SpotifyIcon"
import PencilIcon from "./PencilIcon"

interface ToolbarProps {
  onAddPhoto: () => void
  onAddNote: (color: string) => void
  onRecordVoice: () => void
  onAddSpotify: (url: string) => void
  onAddDoodle: () => void
  isRecording: boolean
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddPhoto,
  onAddNote,
  onRecordVoice,
  onAddSpotify,
  onAddDoodle,
  isRecording,
}) => {
  // 可用的便签颜色
  const noteColors = ["yellow", "blue", "green", "pink", "purple", "amber"]

  // 跟踪下三种颜色的状态
  const [colorIndices, setColorIndices] = useState([0, 1, 2])

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

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full">
      <div className="relative h-32 flex justify-center items-center border-2 border-white/30 bg-white/10 backdrop-blur-sm">
        <div className="relative max-w-5xl w-full h-full px-4 mx-auto flex justify-between items-center z-10">
          {/* 拍立得组件 */}
          <Polaroid onClick={onAddPhoto} />

          {/* 三层堆叠便签组件 */}
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

          {/* 麦克风图标 */}
          <MicrophoneIcon isRecording={isRecording} onClick={onRecordVoice} />

          {/* Spotify CD图标 */}
          <SpotifyIcon onAddSpotify={onAddSpotify} />

          {/* Pencil Icon */}
          <PencilIcon onClick={onAddDoodle} />
        </div>
      </div>
    </div>
  )
}

