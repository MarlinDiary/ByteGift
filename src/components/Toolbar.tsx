"use client"

import type React from "react"
import { Polaroid } from "../components/Polaroid"

interface ToolbarProps {
  onAddPhoto: () => void
  onAddNote: (color: string) => void
  onRecordVoice: () => void
  onAddSpotify: (url: string) => void
  onAddDoodle: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddPhoto,
  onAddNote,
  onRecordVoice,
  onAddSpotify,
  onAddDoodle,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-4xl px-4">
      <div
        className="
        relative 
        h-30 
        rounded-t-2xl 
        flex justify-center items-center
        border-2 border-white/30
        shadow-[0_8px_32px_rgba(0,0,0,0.15)]
        bg-white/20 
        backdrop-blur-md
      "
      >
        {/* 工具栏内容容器 */}
        <div
          className="
          relative 
          w-full 
          h-full 
          px-8 
          flex 
          justify-between 
          items-center
          z-10
        "
        >
          {/* Polaroid 组件 */}
          <Polaroid onClick={onAddPhoto} />

          {/* 其他工具占位符 */}
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
            {/* NotePaper 占位 */}
          </div>
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
            {/* Microphone 占位 */}
          </div>
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">{/* CD 占位 */}</div>
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">{/* Pencil 占位 */}</div>
        </div>
      </div>
    </div>
  )
}

