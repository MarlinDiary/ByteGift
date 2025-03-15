"use client"

import type React from "react"
import { Square } from "lucide-react"

interface RecordingProgressProps {
  isRecording: boolean
  currentTime: number
  maxTime: number
  onStop: () => void
}

export const RecordingProgress: React.FC<RecordingProgressProps> = ({ isRecording, currentTime, maxTime, onStop }) => {
  // 格式化时间为 MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // 计算进度百分比
  const progressPercent = (currentTime / maxTime) * 100

  if (!isRecording) return null

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 fade-in">
      <div className="flex items-center bg-white rounded-full h-12 px-4 shadow-lg">
        {/* 录音指示灯 */}
        <div className="w-3 h-3 rounded-full bg-red-500 animate-[pulse_1.5s_ease-in-out_infinite] mr-3"></div>

        {/* 进度条 */}
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* 时间显示 */}
        <div className="w-16 text-center font-mono text-gray-600">{formatTime(currentTime)}</div>

        {/* 停止按钮 */}
        <button
          onClick={onStop}
          className="ml-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Square className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  )
}

