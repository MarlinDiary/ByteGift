"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Loader2, X } from "lucide-react"

interface SpotifyContentProps {
  initialUrl?: string
  isDragging?: boolean
}

export const SpotifyContent: React.FC<SpotifyContentProps> = ({
  initialUrl = "https://open.spotify.com/track/6fCpZU76MwKF2TMsgwwhQj?si=9cab40bf08694615",
  isDragging = false,
}) => {
  const [url, setUrl] = useState(initialUrl)
  const [displayUrl, setDisplayUrl] = useState(initialUrl)
  const [isEditing, setIsEditing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch Spotify oEmbed data to get the proper iframe src
  useEffect(() => {
    const fetchOembed = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
        if (!response.ok) {
          throw new Error("Failed to fetch Spotify embed")
        }
        const data = await response.json()

        // Extract iframe src from HTML string
        const srcMatch = data.html.match(/src="([^"]+)"/)
        if (!srcMatch) throw new Error("Could not find iframe src")
        setIframeSrc(srcMatch[1])
      } catch (err) {
        setError("Error loading Spotify embed")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOembed()
  }, [url])

  // Handle URL submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUrl(displayUrl)
    setIsEditing(false)
    setIsLoading(true)
  }

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  return (
    <div
      className={`transition-shadow duration-300 rounded-lg overflow-hidden ${
        isDragging ? "shadow-2xl" : "shadow-lg hover:shadow-2xl"
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        setIsEditing(false)
      }}
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-[300px]">
        {/* URL input - only visible on hover */}
        <div
          className={`bg-gray-100 border-b border-gray-200 p-2 transition-all duration-300 ${
            isHovering ? "opacity-100 h-10" : "opacity-0 h-0 p-0 overflow-hidden"
          }`}
        >
          {/* URL input field */}
          <form onSubmit={handleSubmit} className="w-full relative">
            <input
              ref={inputRef}
              type="text"
              value={displayUrl}
              onChange={(e) => setDisplayUrl(e.target.value)}
              onFocus={() => setIsEditing(true)}
              onBlur={() => !displayUrl && setDisplayUrl(url)}
              className="w-full py-1 px-3 text-xs bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {isEditing && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setDisplayUrl("")
                  inputRef.current?.focus()
                }}
              >
                <X size={12} />
              </button>
            )}
          </form>
        </div>

        {/* Content area */}
        <div className="p-2">
          {isLoading ? (
            <div className="h-[152px] flex items-center justify-center bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="h-[152px] flex items-center justify-center bg-white text-red-500">{error}</div>
          ) : (
            iframeSrc && (
              <iframe
                src={iframeSrc}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="transform-gpu"
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default SpotifyContent

