"use client"

import React, { useState, useEffect, useRef } from "react"
import { Polaroid } from "./Polaroid"
import { MicrophoneIcon } from "./MicrophoneIcon"
import { SpotifyIcon } from "./SpotifyIcon"
import { PencilIcon } from "./PencilIcon"
import { DoodleCanvas } from "./DoodleCanvas"
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
  // 可用的便签颜色
  const noteColors = ["yellow", "blue", "green", "pink", "purple", "amber"]

  // 跟踪下三种颜色的状态
  const [colorIndices, setColorIndices] = useState([0, 1, 2])

  // 控制工具是否显示
  const [showTools, setShowTools] = useState(true)

  // 在绘画模式变更时处理工具显示状态
  useEffect(() => {
    if (isDoodling) {
      setShowTools(false)
    } else {
      setShowTools(true)
    }
  }, [isDoodling])

  // 处理便签创建和颜色轮换
  const handleAddNote = () => {
    const currentColor = noteColors[colorIndices[0]]
    const newIndices = [
      (colorIndices[0] + 1) % noteColors.length,
      (colorIndices[1] + 1) % noteColors.length,
      (colorIndices[2] + 1) % noteColors.length,
    ]
    setColorIndices(newIndices)
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
      height: "8rem",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.2,
        delay: 0
      }
    },
    expanded: {
      y: 0,
      opacity: 1,
      height: "33vh",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.2,
        delay: 0
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
        stiffness: 200,
        damping: 25,
        duration: 0.2,
        delay: custom * 0.03,
      }
    }),
    exit: {
      y: 50,
      opacity: 0,
      transition: {
        duration: 0.15
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
        stiffness: 200,
        damping: 25,
        duration: 0.2,
        delay: 0.09,
      }
    },
    exit: {
      y: 50,
      opacity: 0,
      transition: {
        duration: 0.15
      }
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-4xl px-4 z-10">
      {/* 背景层 */}
      <motion.div
        className="relative rounded-t-2xl border-2 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] bg-white/20 backdrop-blur-md"
        variants={backgroundVariants}
        initial="initial"
        animate={isDoodling ? "expanded" : "normal"}
      >
        {/* 绘画画布 */}
        {isDoodling && (
          <DoodleCanvas onSave={onSaveDoodle} onCancel={onAddDoodle} />
        )}
      </motion.div>

      {/* 工具层 */}
      <AnimatePresence>
        {showTools && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 w-full px-8 h-32 flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
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
                {/* 底层便签 */}
                <div
                  className={`absolute inset-0 ${bottomNoteStyles.bg} ${bottomNoteStyles.border} shadow-md rounded-sm border transform rotate-12 group-hover:rotate-32 group-hover:translate-x-2 group-hover:translate-y-2 group-hover:shadow-xl transition-all duration-500 z-10`}
                  style={{ transition: "background-color 0.5s, border-color 0.5s, transform 0.5s, box-shadow 0.5s" }}
                />

                {/* 中层便签 */}
                <div
                  className={`absolute inset-0 ${middleNoteStyles.bg} ${middleNoteStyles.border} shadow-md rounded-sm border transform rotate-0 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-500 z-20`}
                  style={{ transition: "background-color 0.5s, border-color 0.5s, transform 0.5s, box-shadow 0.5s" }}
                />

                {/* 顶层便签 */}
                <div
                  className={`absolute inset-0 ${topNoteStyles.bg} ${topNoteStyles.border} shadow-md rounded-sm border transform -rotate-12 group-hover:-rotate-24 group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-500 z-30`}
                  style={{ transition: "background-color 0.5s, border-color 0.5s, transform 0.5s, box-shadow 0.5s" }}
                />

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
              <PencilIcon onClick={onAddDoodle} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

