"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import GridBackground from "../components/GridBackground"
import { Toolbar } from "../components/Toolbar"
import DraggableItem from "../components/DraggableItem"
import PolaroidContent from "../components/PolaroidContent"
import NoteContent from "../components/NoteContent"
import AudioContent from "../components/AudioContent"
import SpotifyContent from "../components/SpotifyContent"
import DoodleContent from "../components/DoodleContent"
import DoodleCanvas from "../components/DoodleCanvas"
import audioRecorder from "../services/audioRecorder"
import { ShareDialog } from '@/components/ShareDialog'
import { Share2 } from 'lucide-react'

interface Item {
  id: string
  position: { x: number; y: number }
  zIndex: number
  rotation: number
  type: "photo" | "note" | "audio" | "spotify" | "doodle"
  data: {
    imageUrl?: string
    dateTaken?: string
    color?: string
    content?: string
    audioUrl?: string
    spotifyUrl?: string
    svgData?: string
  }
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [highestZIndex, setHighestZIndex] = useState(10) // 初始z-index值
  const [isRecording, setIsRecording] = useState(false)
  const [isDoodling, setIsDoodling] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const recordingTimerId = useRef<NodeJS.Timeout | null>(null)
  const maxRecordingTime = audioRecorder.getMaxRecordingTime()
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  // 处理录音计时器
  useEffect(() => {
    if (isRecording) {
      recordingTimerId.current = setTimeout(() => {
        handleStopRecording()
      }, maxRecordingTime * 1000)
    } else {
      if (recordingTimerId.current) {
        clearTimeout(recordingTimerId.current)
      }
    }

    return () => {
      if (recordingTimerId.current) {
        clearTimeout(recordingTimerId.current)
      }
    }
  }, [isRecording, maxRecordingTime])

  // 开始录音
  const handleStartRecording = async () => {
    try {
      await audioRecorder.startRecording()
      setIsRecording(true)
    } catch (error) {
      console.error("开始录音失败:", error)
    }
  }

  // 停止录音
  const handleStopRecording = async () => {
    try {
      const audioUrl = await audioRecorder.stopRecording()
      setIsRecording(false)

      // 获取画布尺寸以确定随机位置范围
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      const maxX = canvasRect ? canvasRect.width - 320 : window.innerWidth - 320
      const maxY = canvasRect ? canvasRect.height - 300 : window.innerHeight - 300

      // 生成随机位置，避开边缘
      const randomX = Math.max(50, Math.random() * maxX)
      const randomY = Math.max(50, Math.random() * (maxY - 100))

      // 新音频使用当前最高z-index
      const newZIndex = highestZIndex + 1
      setHighestZIndex(newZIndex)

      // 随机旋转角度在-5到5度之间
      const rotation = Math.random() * 10 - 5

      const newItem: Item = {
        id: uuidv4(),
        position: { x: randomX, y: randomY },
        zIndex: newZIndex,
        rotation,
        type: "audio",
        data: {
          audioUrl,
        },
      }

      setItems((prevItems) => [...prevItems, newItem])
    } catch (error) {
      console.error("停止录音失败:", error)
    }
  }

  // 处理录音按钮点击
  const handleRecordVoice = () => {
    if (isRecording) {
      handleStopRecording()
    } else {
      handleStartRecording()
    }
  }

  // 处理添加照片
  const handleAddPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // 从图像提取日期
  const extractImageDate = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target?.result) {
          resolve(undefined)
          return
        }

        try {
          // 尝试从EXIF数据读取日期
          import("exif-js")
            .then((EXIF) => {
              const exifData = EXIF.default.readFromBinaryFile(e.target!.result as ArrayBuffer)

              if (exifData && exifData.DateTimeOriginal) {
                // EXIF日期格式通常为: YYYY:MM:DD HH:MM:SS
                const dateParts = exifData.DateTimeOriginal.split(" ")[0].split(":")
                if (dateParts.length === 3) {
                  const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`
                  resolve(formattedDate)
                  return
                }
              }

              // 如果没有EXIF日期，使用文件的最后修改日期
              const lastModified = new Date(file.lastModified).toLocaleDateString()
              resolve(lastModified)
            })
            .catch(() => {
              // 如果EXIF库失败，使用文件的最后修改日期
              const lastModified = new Date(file.lastModified).toLocaleDateString()
              resolve(lastModified)
            })
        } catch (error) {
          // 出错时，使用当前日期
          resolve(new Date().toLocaleDateString())
        }
      }

      reader.readAsArrayBuffer(file)
    })
  }

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const imageUrl = URL.createObjectURL(file)

      // 提取照片日期
      const dateTaken = await extractImageDate(file)

      // 获取画布尺寸以确定随机位置范围
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      const maxX = canvasRect ? canvasRect.width - 200 : window.innerWidth - 200
      const maxY = canvasRect ? canvasRect.height - 300 : window.innerHeight - 300

      // 生成随机位置，避开边缘
      const randomX = Math.max(50, Math.random() * maxX)
      const randomY = Math.max(50, Math.random() * (maxY - 100))

      // 新照片使用当前最高z-index
      const newZIndex = highestZIndex + 1
      setHighestZIndex(newZIndex)

      // 随机旋转角度在-5到5度之间
      const rotation = Math.random() * 10 - 5

      const newItem: Item = {
        id: uuidv4(),
        position: { x: randomX, y: randomY },
        zIndex: newZIndex,
        rotation,
        type: "photo",
        data: {
          imageUrl,
          dateTaken,
        },
      }

      setItems((prevItems) => [...prevItems, newItem])
    }

    // 重置文件输入，以便可以再次选择相同的文件
    if (e.target) {
      e.target.value = ""
    }
  }

  // 更新项目位置
  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, position: newPosition } : item)))
  }

  // 开始拖动项目时，更新其z-index为最高
  const handleDragStart = (id: string) => {
    const newZIndex = highestZIndex + 1
    setHighestZIndex(newZIndex)

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, zIndex: newZIndex } : item)))
  }

  const handleAddNote = (color: string) => {
    // 获取画布尺寸以确定随机位置范围
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const maxX = canvasRect ? canvasRect.width - 200 : window.innerWidth - 200
    const maxY = canvasRect ? canvasRect.height - 300 : window.innerHeight - 300

    // 生成随机位置，避开边缘
    const randomX = Math.max(50, Math.random() * maxX)
    const randomY = Math.max(50, Math.random() * (maxY - 100))

    // 新便签使用当前最高z-index
    const newZIndex = highestZIndex + 1
    setHighestZIndex(newZIndex)

    // 随机旋转角度在-12到12度之间（可以向左或向右倾斜）
    const rotation = Math.random() * 24 - 12

    const newItem: Item = {
      id: uuidv4(),
      position: { x: randomX, y: randomY },
      zIndex: newZIndex,
      rotation,
      type: "note",
      data: {
        color,
      },
    }

    setItems((prevItems) => [...prevItems, newItem])
  }

  const handleAddSpotify = (url: string) => {
    // 获取画布尺寸以确定随机位置范围
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const maxX = canvasRect ? canvasRect.width - 320 : window.innerWidth - 320
    const maxY = canvasRect ? canvasRect.height - 400 : window.innerHeight - 400

    // 生成随机位置，避开边缘
    const randomX = Math.max(50, Math.random() * maxX)
    const randomY = Math.max(50, Math.random() * (maxY - 100))

    // 新Spotify组件使用当前最高z-index
    const newZIndex = highestZIndex + 1
    setHighestZIndex(newZIndex)

    // 随机旋转角度在-3到3度之间（轻微倾斜）
    const rotation = Math.random() * 6 - 3

    const newItem: Item = {
      id: uuidv4(),
      position: { x: randomX, y: randomY },
      zIndex: newZIndex,
      rotation,
      type: "spotify",
      data: {
        spotifyUrl: url,
      },
    }

    setItems((prevItems) => [...prevItems, newItem])
  }

  const handleAddDoodle = () => {
    setIsDoodling(true)
  }

  const handleSaveDoodle = (svgData: string) => {
    // 获取画布尺寸以确定随机位置范围
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const maxX = canvasRect ? canvasRect.width - 200 : window.innerWidth - 200
    const maxY = canvasRect ? canvasRect.height - 200 : window.innerHeight - 200

    // 生成随机位置，避开边缘
    const randomX = Math.max(50, Math.random() * maxX)
    const randomY = Math.max(50, Math.random() * maxY)

    // 新涂鸦使用当前最高z-index
    const newZIndex = highestZIndex + 1
    setHighestZIndex(newZIndex)

    // 随机旋转角度在-5到5度之间
    const rotation = Math.random() * 10 - 5

    // Parse SVG to get dimensions
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgData, "image/svg+xml")
    const svgElement = svgDoc.querySelector("svg")

    // Ensure minimum size for very small doodles
    const width = svgElement?.getAttribute("width")
      ? Math.max(100, Number.parseInt(svgElement.getAttribute("width") || "100"))
      : 100
    const height = svgElement?.getAttribute("height")
      ? Math.max(100, Number.parseInt(svgElement.getAttribute("height") || "100"))
      : 100

    const newItem: Item = {
      id: uuidv4(),
      position: { x: randomX, y: randomY },
      zIndex: newZIndex,
      rotation,
      type: "doodle",
      data: {
        svgData,
      },
    }

    setItems((prevItems) => [...prevItems, newItem])
    setIsDoodling(false)
  }

  const handleCancelDoodle = () => {
    setIsDoodling(false)
  }

  const handleNoteContentChange = (id: string, content: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, data: { ...item.data, content } }
          : item
      )
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <GridBackground />

      {/* 分享按钮 */}
      <button
        onClick={() => setIsShareDialogOpen(true)}
        className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
      >
        <Share2 className="w-5 h-5 text-gray-600" />
      </button>

      {/* 分享对话框 */}
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        items={items}
      />

      {/* 隐藏的文件输入 */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* 画布区域 - 用于放置照片、便签和音频 */}
      <div ref={canvasRef} className="absolute inset-0 z-0 overflow-hidden">
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            id={item.id}
            initialPosition={item.position}
            zIndex={item.zIndex}
            rotation={item.rotation}
            onPositionChange={handlePositionChange}
            onDragStart={handleDragStart}
          >
            {item.type === "photo" ? (
              <PolaroidContent imageUrl={item.data.imageUrl || ""} dateTaken={item.data.dateTaken} />
            ) : item.type === "note" ? (
              <NoteContent
                color={item.data.color || "yellow"}
                content={item.data.content || ""}
                onContentChange={(content) => handleNoteContentChange(item.id, content)}
              />
            ) : item.type === "spotify" ? (
              <SpotifyContent initialUrl={item.data.spotifyUrl} />
            ) : item.type === "doodle" ? (
              <DoodleContent svgData={item.data.svgData || ""} />
            ) : (
              <AudioContent audioUrl={item.data.audioUrl || ""} />
            )}
          </DraggableItem>
        ))}
      </div>

      {/* Toolbar - 当涂鸦模式时添加动画类 */}
      <div
        className={`fixed bottom-0 left-0 right-0 w-full transition-transform duration-500 ${isDoodling ? "translate-y-full" : ""}`}
      >
        <Toolbar
          onAddPhoto={handleAddPhoto}
          onAddNote={handleAddNote}
          onRecordVoice={handleRecordVoice}
          onAddSpotify={handleAddSpotify}
          onAddDoodle={handleAddDoodle}
          isRecording={isRecording}
        />
      </div>

      {/* 涂鸦画布 - 仅在涂鸦模式时显示 */}
      {isDoodling && <DoodleCanvas onSave={handleSaveDoodle} onCancel={handleCancelDoodle} />}

      <style jsx>{`
      @keyframes slide-up {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
      
      .animate-slide-up {
        animation: slide-up 0.3s ease-out forwards;
      }
    `}</style>
    </div>
  )
}

