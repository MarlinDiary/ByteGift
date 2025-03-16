"use client"

import type React from "react"
import Image from "next/image"

interface PencilIconProps {
  onClick: () => void
}

export const PencilIcon: React.FC<PencilIconProps> = ({ onClick }) => {
  return (
    <div
      className="group z-10 relative hover:shadow-2xl"
      style={{
        transform: 'translateY(235px)',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div
        className="transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:-translate-y-2 group-hover:rotate-4"
      >
        <Image
          src="/pencil.svg"
          alt="铅笔图标"
          width={32}
          height={160}
          className="transition-all duration-300 ease-in-out"
        />
      </div>
      <button
        onClick={onClick}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="添加涂鸦"
      ></button>
    </div>
  )
}

export default PencilIcon

