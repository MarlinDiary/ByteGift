"use client"

import type React from "react"
import { Baby } from "lucide-react"

interface PolaroidProps {
  onClick: () => void
}

export const Polaroid: React.FC<PolaroidProps> = ({ onClick }) => {
  return (
    <div className="group z-10 rotate-6 overflow-hidden transform translate-y-2 transition-all shadow-lg duration-300 ease-in-out hover:-translate-y-10 hover:shadow-2xl hover:scale-110 hover:rotate-3">
      <div className="w-32 h-40 bg-white p-2 shadow-md border border-stone-200 rounded-md relative">
        {/* Subtle inner shadow at the top */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-stone-100/50" />

        {/* Photo area with inner shadow */}
        <div className="bg-stone-100 aspect-square overflow-hidden flex items-center justify-center relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
          <Baby className="w-16 h-16 text-stone-300" strokeWidth={1.5} />
          {/* Photo area inner shadow overlay */}
          <div className="absolute inset-0 shadow-[inset_0_0_4px_rgba(0,0,0,0.1)]" />
        </div>

        {/* Bottom area with subtle gradient */}
        <div className="left-0 right-0 h-10 flex items-center justify-center bg-gradient-to-b from-transparent to-stone-50">
          <span className="text-sm text-gray-500 select-none font-['Caveat',_cursive] transform rotate-[-1deg]">Add Photo</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        aria-label="Add photo"
      ></button>
    </div>
  )
}

