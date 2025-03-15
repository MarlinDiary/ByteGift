"use client"

import type React from "react"
import { useRef, useEffect } from "react"

interface DoodleContentProps {
  svgData: string
  isDragging?: boolean
}

export const DoodleContent: React.FC<DoodleContentProps> = ({ svgData, isDragging = false }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      // 先清空容器
      containerRef.current.innerHTML = ""

      try {
        // 解析SVG内容
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgData, "image/svg+xml")
        const svgElement = svgDoc.querySelector("svg")

        if (svgElement) {
          // 加粗所有路径
          const paths = svgElement.querySelectorAll("path")
          paths.forEach(path => {
            // 获取当前宽度并加粗
            let currentWidth = parseFloat(path.getAttribute("stroke-width") || "8")
            // 将宽度乘以1.1倍
            currentWidth = currentWidth * 1.1
            path.setAttribute("stroke-width", currentWidth.toString())
            path.setAttribute("vector-effect", "non-scaling-stroke")
          })

          // 确保SVG属性正确
          svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet")
          svgElement.setAttribute("overflow", "visible")

          // 添加修改后的SVG
          containerRef.current.appendChild(svgElement)
        } else {
          // 如果解析失败，回退到原来的方式
          containerRef.current.innerHTML = svgData
        }
      } catch (e) {
        // 出错时回退
        containerRef.current.innerHTML = svgData
        console.error("Error parsing SVG:", e)
      }

      // 无论如何，确保SVG样式正确
      const svg = containerRef.current.querySelector("svg")
      if (svg) {
        svg.style.display = "block"
        svg.style.maxWidth = "100%"
        svg.style.maxHeight = "100%"
        svg.style.overflow = "visible"
      }
    }
  }, [svgData])

  return <div ref={containerRef} className="min-w-[100px] min-h-[100px] p-2" />
}

export default DoodleContent

