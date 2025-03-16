"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"

interface PolaroidContentProps {
  imageUrl: string
  dateTaken?: string
  isDragging?: boolean
  imageWidth?: number
  imageHeight?: number
  scale?: number
}

export const PolaroidContent: React.FC<PolaroidContentProps> = ({
  imageUrl,
  dateTaken,
  isDragging = false,
  imageWidth,
  imageHeight,
  scale
}) => {
  // 内部随机缩放状态
  const [internalScale, setInternalScale] = useState<number>(1)

  // 组件挂载时生成随机缩放值，并在组件生命周期内保持不变
  useEffect(() => {
    // 如果外部提供了scale，则使用外部值，否则生成随机值
    if (scale !== undefined) {
      setInternalScale(scale)
    } else {
      // 生成0.7到1.3之间的随机数
      const randomScale = 0.7 + Math.random() * 0.6
      setInternalScale(randomScale)
    }
  }, [scale]) // 仅在scale变化或组件挂载时执行

  // Format date as YYYY.MM.DD
  const formatDate = (dateString?: string) => {
    try {
      const date = dateString ? new Date(dateString) : new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}.${month}.${day}`
    } catch (error) {
      // If date parsing fails, return current date formatted
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const day = String(now.getDate()).padStart(2, "0")
      return `${year}.${month}.${day}`
    }
  }

  // 扩大缩放范围，增加随机性（0.7到1.3）
  const normalizedScale = Math.max(0.7, Math.min(1.3, internalScale))

  // 设置绝对尺寸限制（单位：rem），扩大范围
  const MIN_WIDTH = 16 // 最小宽度16rem
  const MAX_WIDTH = 28 // 最大宽度28rem

  // 计算实际宽度（受最大和最小限制）
  const width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, 20 * normalizedScale))

  return (
    <div
      className={`transition-shadow duration-300 rounded-md overflow-hidden ${isDragging ? "shadow-2xl" : "shadow-lg hover:shadow-2xl"}`}
    >
      <div
        className="bg-white p-3 border border-stone-200 rounded-md overflow-hidden"
        style={{ width: `${width}rem` }}
      >
        {/* Photo area with inner shadow */}
        <div className="bg-gray-50 overflow-hidden flex items-center justify-center relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] rounded-sm">
          <div className="relative w-full">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt="Polaroid photo"
              width={imageWidth || 500}
              height={imageHeight || 500}
              className="object-contain w-full rounded-sm"
            />
            {/* Photo area inner shadow overlay */}
            <div className="absolute inset-0 shadow-[inset_0_0_4px_rgba(0,0,0,0.1)]" />
          </div>
        </div>

        {/* Bottom area with subtle gradient and centered date */}
        <div className="mt-2 flex items-center justify-center h-8">
          <span className="text-gray-500 select-none font-caveat text-lg">{formatDate(dateTaken)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * 现在组件会自动生成随机大小，无需手动传入scale参数
 * 每个拍立得卡片都会有不同的随机大小
 * 如果需要固定大小，可以传入固定的scale值
 */

export default PolaroidContent

