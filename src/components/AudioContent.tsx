"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface AudioContentProps {
  audioUrl: string
  isDragging?: boolean
}

export const AudioContent: React.FC<AudioContentProps> = ({ audioUrl, isDragging = false }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [animationPhase, setAnimationPhase] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  // 随机颜色
  const [waveColor, setWaveColor] = useState<string>("#ec4899") // 默认粉色

  // 切换播放/暂停
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((err) => {
          console.error("播放失败:", err)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  // 从音频生成波形数据
  const generateWaveform = async (url: string) => {
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      const channelData = audioBuffer.getChannelData(0)

      // 采样音频数据以获得合理数量的点
      const samples = 100
      const blockSize = Math.floor(channelData.length / samples)
      const dataPoints: number[] = []

      for (let i = 0; i < samples; i++) {
        let sum = 0
        for (let j = 0; j < blockSize; j++) {
          const index = i * blockSize + j
          if (index < channelData.length) {
            sum += Math.abs(channelData[index])
          }
        }
        dataPoints.push(sum / blockSize)
      }

      // 将数据归一化为0到1之间的值
      const maxValue = Math.max(...dataPoints)
      const normalizedData = dataPoints.map((point) => point / (maxValue || 1))

      setWaveformData(normalizedData)
    } catch (error) {
      console.error("生成波形时出错:", error)
      // 如果出错，生成随机波形
      const randomData = Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2)
      setWaveformData(randomData)
    }
  }

  // 在useEffect中添加随机颜色生成
  useEffect(() => {
    // 生成随机颜色
    const generateRandomColor = () => {
      // 预定义一些好看的颜色
      const colors = [
        "#ec4899", // 粉色
        "#3b82f6", // 蓝色
        "#10b981", // 绿色
        "#f59e0b", // 琥珀
        "#8b5cf6", // 紫色
        "#ef4444", // 红色
        "#06b6d4", // 青色
      ]

      // 随机选择一个颜色
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      setWaveColor(randomColor)
    }

    generateRandomColor()
  }, [])

  // 在画布上绘制波形
  const drawWaveform = (phase = 0) => {
    if (!canvasRef.current || waveformData.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = width / waveformData.length

    // 清除画布
    ctx.clearRect(0, 0, width, height)

    // 计算呼吸效果的缩放因子 (0.8 到 1.2 之间)
    const breathScale = isPlaying ? 0.85 + 0.3 * Math.sin(phase) : 1

    // 绘制波形条
    waveformData.forEach((value, index) => {
      // 应用呼吸效果到波形高度
      const barHeight = value * height * 0.8 * breathScale
      const x = index * barWidth
      const y = (height - barHeight) / 2

      // 设置颜色
      ctx.fillStyle = waveColor

      // 绘制波形条
      ctx.fillRect(x, y, barWidth - 1, barHeight)
    })
  }

  // 初始化音频元素
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current

      const handleEnded = () => {
        setIsPlaying(false)
      }

      audio.addEventListener("ended", handleEnded)

      // 音频加载时生成波形
      generateWaveform(audioUrl)

      return () => {
        audio.removeEventListener("ended", handleEnded)
      }
    }
  }, [audioUrl])

  // 处理呼吸动画
  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      // 更新动画阶段 (0 到 2π)
      setAnimationPhase((prev) => (prev + 0.05) % (Math.PI * 2))
      animationFrameId = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isPlaying])

  // 当动画阶段变化时重绘波形
  useEffect(() => {
    drawWaveform(animationPhase)
  }, [animationPhase, waveformData])

  // 窗口大小变化时重绘波形
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        canvasRef.current.width = width
        drawWaveform(animationPhase)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // 初始调用

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [waveformData, animationPhase])

  return (
    <div
      className={`transition-shadow duration-300 rounded-lg overflow-hidden ${
        isDragging ? "shadow-2xl" : "shadow-lg hover:shadow-2xl"
      }`}
    >
      <div className="w-64 bg-white p-3 border border-gray-200 rounded-lg">
        {/* 隐藏的音频元素 */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* 波形可视化 - 点击即可播放/暂停 */}
        <div
          ref={containerRef}
          className="relative h-20 bg-gray-50 rounded-md overflow-hidden cursor-pointer shadow-[inset_0_0_4px_rgba(0,0,0,0.1)]"
          onClick={togglePlay}
        >
          {/* 添加微妙的顶部高光效果 */}
          <div className="absolute inset-x-0 top-0 h-[6px] bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

          <canvas ref={canvasRef} width={256} height={80} className="w-full h-full" />

          {/* 播放状态指示器 */}
          <div
            className={`absolute top-2 right-2 w-2 h-2 rounded-full transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-50"}`}
            style={{ backgroundColor: waveColor }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default AudioContent

