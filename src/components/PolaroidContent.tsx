"use client"

import type React from "react"
import Image from "next/image"

interface PolaroidContentProps {
  imageUrl: string
  dateTaken?: string
  isDragging?: boolean
}

export const PolaroidContent: React.FC<PolaroidContentProps> = ({ imageUrl, dateTaken, isDragging = false }) => {
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

  return (
    <div
      className={`transition-shadow duration-300 rounded-md overflow-hidden ${isDragging ? "shadow-2xl" : "shadow-lg hover:shadow-2xl"}`}
    >
      <div className="w-48 h-56 bg-white p-3 border border-stone-200 rounded-md overflow-hidden">
        {/* Photo area with inner shadow */}
        <div className="bg-gray-50 aspect-square overflow-hidden flex items-center justify-center relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] rounded-sm">
          <Image src={imageUrl || "/placeholder.svg"} alt="Polaroid photo" fill className="object-cover rounded-sm" />
          {/* Photo area inner shadow overlay */}
          <div className="absolute inset-0 shadow-[inset_0_0_4px_rgba(0,0,0,0.1)]" />
        </div>

        {/* Bottom area with subtle gradient */}
        <div className="left-0 right-0 h-10 flex items-center justify-center bg-gradient-to-b from-transparent to-white">
          <span className="text-gray-500 select-none font-caveat text-lg">{formatDate(dateTaken)}</span>
        </div>
      </div>
    </div>
  )
}

export default PolaroidContent

