"use client"

import type React from "react"
import Image from "next/image"

interface MicrophoneIconProps {
  isRecording: boolean
  onClick: () => void
}

export const MicrophoneIcon: React.FC<MicrophoneIconProps> = ({ isRecording, onClick }) => {
  return (
    <div className="group z-10 transform translate-y-6 transition-all duration-300 ease-in-out drop-shadow-lg hover:drop-shadow-2xl hover:-translate-y-1 hover:scale-105 hover:rotate-6">
      <div className="relative w-20 h-48 flex flex-col items-center transition-all duration-300 ease-in-out group-hover:-translate-y-2 group-hover:rotate-6">
        <Image
          src={isRecording ? "/images/microphone-open.png" : "/images/microphone.png"}
          alt="Microphone"
          width={80}
          height={192}
          className="object-contain"
          priority
        />
      </div>
      <button
        onClick={onClick}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Record voice"
      ></button>
    </div>
  )
}

