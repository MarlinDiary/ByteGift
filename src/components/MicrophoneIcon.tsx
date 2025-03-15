"use client"

import type React from "react"

interface MicrophoneIconProps {
  isRecording: boolean
  onClick: () => void
}

export const MicrophoneIcon: React.FC<MicrophoneIconProps> = ({ isRecording, onClick }) => {
  return (
    <div className="group z-10 transform translate-y-6 transition-all duration-300 ease-in-out drop-shadow-lg hover:drop-shadow-2xl hover:-translate-y-1 hover:scale-105 hover:rotate-6">
      <div className="w-20 h-48 flex flex-col items-center transition-all duration-300 ease-in-out group-hover:-translate-y-2 group-hover:rotate-6">
        {/* Microphone Head */}
        <div className="w-20 h-20 relative z-10 border border-gray-600/40 transition-all duration-300 ease-in-out drop-shadow-lg hover:drop-shadow-2xl rounded-full">
          {/* Outer frame with metallic effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-300 via-gray-200 to-gray-400">
            {/* Subtle ring highlight */}
            <div className="absolute inset-[1px] rounded-full bg-gradient-to-tr from-white/40 via-transparent to-black/20"></div>

            {/* Mesh pattern container */}
            <div className="absolute inset-[2px] rounded-full overflow-hidden">
              {/* Complex mesh pattern with multiple layers */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_1px,_#silver_1px)] bg-[length:4px_4px]"></div>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_46%,_#9CA3AF_47%,_#9CA3AF_53%,_transparent_54%)] bg-[length:4px_4px]"></div>
              <div className="absolute inset-0 bg-[linear-gradient(-45deg,_transparent_46%,_#9CA3AF_47%,_#9CA3AF_53%,_transparent_54%)] bg-[length:4px_4px]"></div>

              {/* Subtle inner shadow */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"></div>

              {/* Light reflection */}
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/4 bg-white/10 rounded-full blur-sm transform -rotate-12"></div>
            </div>
          </div>

          {/* Center band with metallic finish */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[3px] bg-gradient-to-r from-gray-500 via-gray-300 to-gray-500">
            {/* Highlight on the band */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-1/2"></div>
          </div>
        </div>

        {/* Microphone Body */}
        <div className="w-16 h-32 relative -mt-4">
          {/* Main body with enhanced 3D gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-32 overflow-hidden">
            {/* Base dark gradient with more depth */}
            <div className="absolute inset-0 bg-gradient-to-b z-20 from-[#1A1A1A] via-[#2C2C2C] to-[#1A1A1A] clip-path-microphone">
              {/* Left highlight */}
              <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/15 to-transparent" />

              {/* Right shadow */}
              <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/30 to-transparent" />

              {/* Vertical highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20" />

              {/* Subtle texture */}
              <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+')]"></div>

              {/* Recording indicator light - moved lower to avoid being hidden by the head */}
              <div
                className={`absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-30 overflow-hidden ${isRecording ? "recording-light" : "bg-gray-700 border border-gray-800/50"}`}
              >
                {/* Inner glow for recording state */}
                {isRecording && (
                  <>
                    {/* Base color */}
                    <div className="absolute inset-0 bg-red-500"></div>

                    {/* Pulsing inner light */}
                    <div className="absolute inset-0 bg-red-400 animate-[pulse_1.5s_ease-in-out_infinite]"></div>

                    {/* Center highlight */}
                    <div className="absolute inset-[1px] bg-red-300 rounded-full opacity-70"></div>

                    {/* Reflection */}
                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/30 rounded-t-full"></div>
                  </>
                )}
              </div>

              {/* Control button */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-6 h-2 bg-gray-700 rounded-sm border border-gray-600/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"></div>

              {/* Decorative lines */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-8 h-px bg-gray-700"></div>
              <div className="absolute top-22 left-1/2 -translate-x-1/2 w-8 h-px bg-gray-700"></div>
              <div className="absolute top-24 left-1/2 -translate-x-1/2 w-8 h-px bg-gray-700"></div>
            </div>

            {/* Bottom cap with enhanced detail */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] z-10 h-4 bg-gradient-to-b from-[#2C2C2C] to-[#1A1A1A] rounded-b-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]" />

            {/* Connection port at bottom */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-gray-800 rounded-sm z-30"></div>
          </div>
        </div>
      </div>
      <button
        onClick={onClick}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Record voice"
      ></button>
      <style jsx>{`
        .clip-path-microphone {
          clip-path: polygon(0 0, 100% 0, 85% 90%, 15% 90%);
        }
      
      .recording-light {
        border: 1px solid rgba(239, 68, 68, 0.5);
        box-shadow: 0 0 5px rgba(239, 68, 68, 0.5),
                    0 0 10px rgba(239, 68, 68, 0.3),
                    0 0 15px rgba(239, 68, 68, 0.2),
                    inset 0 0 4px rgba(255, 255, 255, 0.4);
      }
    `}</style>
    </div>
  )
}

