"use client"

import type React from "react"

interface SpotifyIconProps {
  onAddSpotify: (url: string) => void
}

export const SpotifyIcon: React.FC<SpotifyIconProps> = ({ onAddSpotify }) => {
  // Default Spotify URL
  const defaultSpotifyUrl = "https://open.spotify.com/track/6fCpZU76MwKF2TMsgwwhQj?si=9cab40bf08694615"

  const handleCDClick = () => {
    onAddSpotify(defaultSpotifyUrl)
  }

  return (
    <div className="group z-10 transform translate-y-4 transition-all duration-300 ease-in-out hover:-translate-y-8">
      <div
        className="w-44 h-44 relative rounded-full hover:shadow-2xl cursor-pointer transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:scale-110"
        onClick={handleCDClick}
      >
        {/* Outer glow effect - not rotating */}
        <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />

        {/* CD disc - this entire element rotates */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-[#e2e2e2] via-[#f5f5f5] to-[#e2e2e2] overflow-hidden animate-cd-spin">
          {/* Rainbow reflection layers - static relative to the disc */}
          <div className="absolute inset-0 bg-[conic-gradient(from_215deg,transparent_0deg,rgba(255,0,0,0.1)_10deg,rgba(255,165,0,0.1)_20deg,rgba(255,255,0,0.1)_30deg,rgba(0,128,0,0.1)_40deg,rgba(0,0,255,0.1)_50deg,rgba(75,0,130,0.1)_60deg,rgba(238,130,238,0.1)_70deg,transparent_80deg)] opacity-70"></div>
          <div className="absolute inset-0 bg-[conic-gradient(from_35deg,transparent_0deg,rgba(255,0,0,0.1)_10deg,rgba(255,165,0,0.1)_20deg,rgba(255,255,0,0.1)_30deg,rgba(0,128,0,0.1)_40deg,rgba(0,0,255,0.1)_50deg,rgba(75,0,130,0.1)_60deg,rgba(238,130,238,0.1)_70deg,transparent_80deg)] opacity-70"></div>

          {/* Record grooves - rotate with the disc */}
          <div className="absolute inset-[15%] rounded-full bg-[repeating-radial-gradient(circle,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_2px)]"></div>

          {/* Center label - rotates with the disc */}
          <div className="absolute inset-[38%] rounded-full bg-gradient-to-b from-[#9ca3af] to-[#4b5563] flex items-center justify-center">
            <div className="absolute inset-[25%] rounded-full bg-[#1f2937]"></div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes cd-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-cd-spin {
          animation: cd-spin 30s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default SpotifyIcon

