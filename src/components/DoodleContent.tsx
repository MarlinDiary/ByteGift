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
          // 设置SVG渲染品质
          svgElement.setAttribute("shape-rendering", "geometricPrecision")
          svgElement.setAttribute("text-rendering", "optimizeLegibility")
          svgElement.setAttribute("image-rendering", "optimizeQuality")

          // 简单处理路径
          const paths = svgElement.querySelectorAll("path")
          paths.forEach(path => {
            // 添加基本属性
            path.setAttribute("stroke-linejoin", "round")
            path.setAttribute("stroke-linecap", "round")

            // 如果路径没有设置fill，设置为none以避免填充影响
            if (!path.hasAttribute("fill")) {
              path.setAttribute("fill", "none")
            }
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
  }, [svgData, isDragging])

  return <div ref={containerRef} className="min-w-[100px] min-h-[100px] p-2" />
}

export default DoodleContent

