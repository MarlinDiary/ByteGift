"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import WaveSurfer from "wavesurfer.js"

interface AudioContentProps {
  audioUrl: string
  isDragging?: boolean
}

export const AudioContent: React.FC<AudioContentProps> = ({ audioUrl, isDragging = false }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [waveColor, setWaveColor] = useState<string>("#ec4899") // 默认粉色

  // 引用
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)

  // 初始化 WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return

    // 清理之前的实例
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy()
    }

    // 选择一个随机颜色
    const colors = [
      "#ec4899", // 粉色
      "#3b82f6", // 蓝色
      "#10b981", // 绿色
      "#f59e0b", // 琥珀
      "#8b5cf6", // 紫色
      "#ef4444", // 红色
      "#06b6d4", // 青色
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setWaveColor(randomColor)

    // 使用统一颜色，没有透明度变化
    const uniformColor = randomColor

    // 创建 WaveSurfer 实例（播放状态下的颜色将在播放/暂停时动态更新）
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: uniformColor, // 使用统一颜色
      progressColor: uniformColor, // 进度颜色与波形颜色保持一致
      url: audioUrl,
      height: 40,
      normalize: true,
      minPxPerSec: 100, // 控制波形密度
      barWidth: 2,
      barGap: 3,
      barRadius: 2,
      cursorWidth: 0, // 移除扫针/光标
      cursorColor: "transparent",
      hideScrollbar: true,
      autoScroll: true,
      autoCenter: true,
      interact: false, // 禁用点击波形跳转到指定位置的功能
    } as any) // 使用类型断言避免类型错误

    // 保存实例
    wavesurferRef.current = wavesurfer

    // 事件监听
    wavesurfer.on("ready", () => {
      setDuration(wavesurfer.getDuration())

      // 计算容器宽度，确保显示窗口精确为3秒
      const containerWidth = containerRef.current?.clientWidth || 256;
      const pixelsPerSecond = containerWidth / 3;
      wavesurfer.zoom(pixelsPerSecond);

      // 初始化时将波形居中在开始位置
      if (typeof wavesurfer.seekTo === 'function') {
        setTimeout(() => {
          wavesurfer.seekTo(0);
        }, 100);
      }

      console.log(`波形图设置为显示3秒窗口: ${pixelsPerSecond}像素/秒`);
    })

    wavesurfer.on("play", () => {
      setIsPlaying(true)

      // 确保滚动立即开始
      setTimeout(() => {
        if (wavesurferRef.current) {
          const currentTime = wavesurferRef.current.getCurrentTime();
          const position = currentTime / wavesurferRef.current.getDuration();
          wavesurferRef.current.seekTo(position);
        }
      }, 50);
    })

    wavesurfer.on("pause", () => {
      setIsPlaying(false)

      // 暂停时确保进度条停留在当前位置
      const position = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
      wavesurfer.seekTo(position);
    })

    wavesurfer.on("finish", () => {
      setIsPlaying(false)

      // 播放结束时重置到开头，准备下一次播放
      setTimeout(() => wavesurfer.seekTo(0), 300);
    })

    wavesurfer.on("timeupdate", (currentTime) => {
      setCurrentTime(currentTime)

      // 直接在timeupdate事件中处理滚动，确保波形始终跟随播放位置
      try {
        // 计算当前位置占总时长的比例
        const position = currentTime / wavesurfer.getDuration();

        // 使用seekTo方法更新进度，但不显示光标
        if (typeof wavesurfer.seekTo === 'function' && isPlaying) {
          wavesurfer.seekTo(position);
        }
      } catch (e) {
        console.warn("滚动失败", e)
      }
    })

    // 清理函数
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy()
      }
    }
  }, [audioUrl])

  // 切换播放/暂停
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause()
      } else {
        // 总是从头开始播放
        wavesurferRef.current.seekTo(0)
        setTimeout(() => {
          // 延迟一点播放，确保seekTo已生效
          if (wavesurferRef.current) {
            wavesurferRef.current.play().catch((err) => {
              console.error("播放失败:", err)
            })
          }
        }, 50)
      }
    }
  }

  return (
    <div
      className={`transition-shadow duration-300 rounded-lg overflow-hidden ${isDragging ? "shadow-2xl" : "shadow-lg hover:shadow-2xl"
        }`}
    >
      <div className="w-64 bg-white p-3 border border-gray-200 rounded-lg">
        {/* 波形容器 */}
        <div
          className="relative h-20 bg-gray-50 rounded-md overflow-hidden cursor-pointer shadow-[inset_0_0_4px_rgba(0,0,0,0.1)]"
          onClick={togglePlay}
        >
          {/* 添加微妙的顶部高光效果 */}
          <div className="absolute inset-x-0 top-0 h-[6px] bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10"></div>

          {/* WaveSurfer将在此容器中渲染 - 使用定位保证居中 */}
          <div className="absolute inset-0 flex items-center justify-center px-2">
            <div ref={containerRef} className="w-full" style={{ margin: '0 auto' }} />
          </div>

          {/* 播放状态指示器 */}
          <div
            className={`absolute top-2 right-2 w-2 h-2 rounded-full transition-opacity duration-300 z-10 ${isPlaying ? "opacity-100" : "opacity-50"}`}
            style={{ backgroundColor: waveColor }}
          ></div>

          {/* 当前播放时间指示器 */}
          <div className="absolute bottom-1 right-2 text-xs text-gray-500 opacity-70 font-mono z-10">
            {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioContent

