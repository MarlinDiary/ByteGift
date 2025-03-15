"use client"

import type React from "react"

import { useState, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import GridBackground from "../components/GridBackground"
import { Toolbar } from "../components/Toolbar"
import DraggablePolaroid from "../components/DraggablePolaroid"

interface Photo {
  id: string
  url: string
  position: { x: number; y: number }
  zIndex: number
  dateTaken?: string
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [highestZIndex, setHighestZIndex] = useState(10) // 初始z-index值
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // 处理添加照片
  const handleAddPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // 从图片中提取日期
  const extractImageDate = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target?.result) {
          resolve(undefined)
          return
        }

        try {
          // 尝试从EXIF数据中读取日期
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
              // 如果EXIF库加载失败，使用文件的最后修改日期
              const lastModified = new Date(file.lastModified).toLocaleDateString()
              resolve(lastModified)
            })
        } catch (error) {
          // 出错时使用当前日期
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

      // 生成随机位置，避免太靠近边缘
      const randomX = Math.max(50, Math.random() * maxX)
      const randomY = Math.max(50, Math.random() * (maxY - 100))

      // 新照片使用当前最高的z-index
      const newZIndex = highestZIndex + 1
      setHighestZIndex(newZIndex)

      const newPhoto: Photo = {
        id: uuidv4(),
        url: imageUrl,
        position: { x: randomX, y: randomY },
        zIndex: newZIndex,
        dateTaken,
      }

      setPhotos((prevPhotos) => [...prevPhotos, newPhoto])
    }

    // 重置文件输入，以便可以再次选择同一文件
    if (e.target) {
      e.target.value = ""
    }
  }

  // 更新照片位置
  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) => (photo.id === id ? { ...photo, position: newPosition } : photo)),
    )
  }

  // 当开始拖动照片时，更新其z-index为最高
  const handleDragStart = (id: string) => {
    const newZIndex = highestZIndex + 1
    setHighestZIndex(newZIndex)

    setPhotos((prevPhotos) => prevPhotos.map((photo) => (photo.id === id ? { ...photo, zIndex: newZIndex } : photo)))
  }

  const handleAddNote = (color: string) => {
    console.log("添加笔记", color)
  }

  const handleRecordVoice = () => {
    console.log("录制语音")
  }

  const handleAddSpotify = (url: string) => {
    console.log("添加Spotify", url)
  }

  const handleAddDoodle = () => {
    console.log("添加涂鸦")
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <GridBackground />

      {/* 隐藏的文件输入 */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* 画布区域 - 用于放置照片 */}
      <div ref={canvasRef} className="absolute inset-0 z-0 overflow-hidden">
        {photos.map((photo) => (
          <DraggablePolaroid
            key={photo.id}
            id={photo.id}
            imageUrl={photo.url}
            initialPosition={photo.position}
            zIndex={photo.zIndex}
            dateTaken={photo.dateTaken}
            onPositionChange={handlePositionChange}
            onDragStart={handleDragStart}
          />
        ))}
      </div>

      <Toolbar
        onAddPhoto={handleAddPhoto}
        onAddNote={handleAddNote}
        onRecordVoice={handleRecordVoice}
        onAddSpotify={handleAddSpotify}
        onAddDoodle={handleAddDoodle}
      />
    </div>
  )
}

