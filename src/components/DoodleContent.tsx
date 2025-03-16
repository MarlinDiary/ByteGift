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

          // 创建滤镜元素用于平滑效果
          const filterId = `smooth-filter-${Math.random().toString(36).substr(2, 9)}`
          const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")

          // 创建高级平滑滤镜
          const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
          filter.setAttribute("id", filterId)
          filter.setAttribute("x", "-50%")
          filter.setAttribute("y", "-50%")
          filter.setAttribute("width", "200%")
          filter.setAttribute("height", "200%")

          // 轻微高斯模糊以平滑线条
          const gaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur")
          gaussianBlur.setAttribute("in", "SourceGraphic")
          gaussianBlur.setAttribute("stdDeviation", "0.2")
          gaussianBlur.setAttribute("result", "blur")

          // 优化对比度
          const componentTransfer = document.createElementNS("http://www.w3.org/2000/svg", "feComponentTransfer")
          componentTransfer.setAttribute("in", "blur")
          componentTransfer.setAttribute("result", "sharpen")

          const funcA = document.createElementNS("http://www.w3.org/2000/svg", "feFuncA")
          funcA.setAttribute("type", "linear")
          funcA.setAttribute("slope", "1.2")
          funcA.setAttribute("intercept", "-0.1")

          componentTransfer.appendChild(funcA)

          // 组合滤镜元素
          filter.appendChild(gaussianBlur)
          filter.appendChild(componentTransfer)
          defs.appendChild(filter)

          // 将defs添加到SVG
          svgElement.insertBefore(defs, svgElement.firstChild)

          // 加粗所有路径并提高平滑度
          const paths = svgElement.querySelectorAll("path")
          paths.forEach(path => {
            // 获取当前宽度并加粗
            let currentWidth = parseFloat(path.getAttribute("stroke-width") || "8")
            // 将宽度乘以1.1倍
            currentWidth = currentWidth * 1.1
            path.setAttribute("stroke-width", currentWidth.toString())
            path.setAttribute("vector-effect", "non-scaling-stroke")

            // 添加平滑属性
            path.setAttribute("stroke-linejoin", "round")
            path.setAttribute("stroke-linecap", "round")

            // 应用平滑滤镜 (仅在非拖动状态下)
            if (!isDragging) {
              path.setAttribute("filter", `url(#${filterId})`)
            }

            // 添加平滑曲线插值
            if (path.hasAttribute("d")) {
              const pathData = path.getAttribute("d") || ""
              // 只对简单的路径进行处理（防止破坏复杂路径）
              if (pathData.indexOf("C") === -1 && pathData.indexOf("c") === -1) {
                try {
                  // 尝试将折线路径转换为曲线路径
                  const smoothedPath = smoothPathData(pathData)
                  if (smoothedPath) {
                    path.setAttribute("d", smoothedPath)
                  }
                } catch (e) {
                  console.warn("Path smoothing failed:", e)
                }
              }
            }

            // 如果路径没有设置fill，设置为none以避免填充影响
            if (!path.hasAttribute("fill")) {
              path.setAttribute("fill", "none")
            }
          })

          // 确保SVG属性正确
          svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet")
          svgElement.setAttribute("overflow", "visible")

          // 为SVG添加整体滤镜
          if (!isDragging) {
            svgElement.style.filter = "url(#" + filterId + ")"
          }

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

        // 添加CSS变换以提高渲染质量
        svg.style.transform = "translateZ(0)"  // 启用GPU加速
        svg.style.backfaceVisibility = "hidden"

        // 轻微抗锯齿效果
        if (!isDragging) {
          svg.style.imageRendering = "auto"
        }
      }
    }
  }, [svgData, isDragging])

  // 辅助函数：将简单的折线路径转换为平滑曲线
  function smoothPathData(pathData: string): string | null {
    // 简单的路径平滑算法
    try {
      // 移除多余空格并分割命令
      const cleaned = pathData.trim().replace(/\s+/g, " ")
      const parts = cleaned.split(/([A-Za-z])/).filter(Boolean)

      let result = ""
      let lastX = 0, lastY = 0
      let penDown = false

      for (let i = 0; i < parts.length; i += 2) {
        const cmd = parts[i]
        const params = (parts[i + 1] || "").trim().split(/\s+|,/).filter(Boolean)

        if (cmd === "M") {
          // 移动命令保持不变
          result += `M${params[0]} ${params[1]} `
          lastX = parseFloat(params[0])
          lastY = parseFloat(params[1])
          penDown = false
        }
        else if (cmd === "L") {
          // 线段转为贝塞尔曲线以平滑
          if (!penDown) {
            // 第一条线段保持不变
            result += `L${params[0]} ${params[1]} `
            penDown = true
          } else {
            // 后续线段使用贝塞尔曲线平滑
            const x = parseFloat(params[0])
            const y = parseFloat(params[1])

            // 计算控制点 (简单的三分之一法则)
            const cp1x = lastX + (x - lastX) / 3
            const cp1y = lastY + (y - lastY) / 3
            const cp2x = lastX + 2 * (x - lastX) / 3
            const cp2y = lastY + 2 * (y - lastY) / 3

            result += `C${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x} ${y} `
          }
          lastX = parseFloat(params[0])
          lastY = parseFloat(params[1])
        }
        else {
          // 其他命令保持不变
          result += cmd + params.join(" ") + " "

          // 更新坐标 (简化处理，可能不适用于所有路径类型)
          if (params.length >= 2) {
            lastX = parseFloat(params[params.length - 2])
            lastY = parseFloat(params[params.length - 1])
          }
        }
      }

      return result.trim()
    } catch (e) {
      console.warn("Path smoothing error:", e)
      return null
    }
  }

  return <div ref={containerRef} className="min-w-[100px] min-h-[100px] p-2" />
}

export default DoodleContent

