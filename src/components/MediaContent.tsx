"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Loader2, X, AlertCircle } from "lucide-react"

interface MediaContentProps {
    initialUrl?: string
    isDragging?: boolean
}

// 支持的媒体平台及其嵌入处理方式
type MediaPlatform = {
    name: string
    regex: RegExp
    getEmbedUrl: (url: string, match: RegExpMatchArray) => string
    width?: number
    height?: number
}

export const MediaContent: React.FC<MediaContentProps> = ({
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
    const [embedHeight, setEmbedHeight] = useState<number>(152)
    const inputRef = useRef<HTMLInputElement>(null)

    // 定义支持的媒体平台
    const mediaPlatforms: MediaPlatform[] = [
        {
            name: "Spotify",
            regex: /https?:\/\/(?:open\.)?spotify\.com\/(?:track|album|artist|playlist)\/([a-zA-Z0-9]+)(?:\?.*)?/,
            getEmbedUrl: (url) => {
                // 对于 Spotify，我们使用 oEmbed API
                return ""  // 实际值将通过 API 获取
            },
            height: 152
        },
        {
            name: "YouTube",
            regex: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:\?.*)?/,
            getEmbedUrl: (url, match) => {
                return `https://www.youtube.com/embed/${match[1]}`
            },
            height: 200
        },
        {
            name: "SoundCloud",
            regex: /https?:\/\/(?:www\.)?soundcloud\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(?:\?.*)?/,
            getEmbedUrl: (url) => {
                return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`
            },
            height: 166
        },
        {
            name: "Vimeo",
            regex: /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)(?:\?.*)?/,
            getEmbedUrl: (url, match) => {
                return `https://player.vimeo.com/video/${match[1]}`
            },
            height: 200
        }
    ]

    // 检测链接平台并获取嵌入 URL
    const getMediaEmbed = async (url: string) => {
        // 尝试找到匹配的平台
        for (const platform of mediaPlatforms) {
            const match = url.match(platform.regex)
            if (match) {
                // 对于 Spotify，我们需要使用 oEmbed API
                if (platform.name === "Spotify") {
                    try {
                        const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
                        if (!response.ok) {
                            throw new Error(`Failed to fetch ${platform.name} embed`)
                        }
                        const data = await response.json()

                        // 从返回的 HTML 中提取 iframe src
                        const srcMatch = data.html.match(/src="([^"]+)"/)
                        if (!srcMatch) throw new Error("Could not find iframe src")

                        setEmbedHeight(platform.height || 152)
                        return srcMatch[1]
                    } catch (err) {
                        throw err
                    }
                } else {
                    // 对于其他平台，直接使用预定义的嵌入 URL 格式
                    setEmbedHeight(platform.height || 152)
                    return platform.getEmbedUrl(url, match)
                }
            }
        }

        // 如果没有匹配的平台，尝试通用嵌入
        if (url.match(/^https?:\/\//)) {
            setEmbedHeight(300)
            return url  // 尝试直接嵌入链接
        }

        throw new Error("Unsupported media link")
    }

    // 加载媒体嵌入
    useEffect(() => {
        const loadEmbed = async () => {
            setIsLoading(true)
            setError(null)

            try {
                if (!url.trim()) {
                    throw new Error("Please enter a valid URL")
                }

                const embedSrc = await getMediaEmbed(url)
                setIframeSrc(embedSrc)
            } catch (err) {
                console.error("Error loading media:", err)
                setError(err instanceof Error ? err.message : "Error loading media")
            } finally {
                setIsLoading(false)
            }
        }

        loadEmbed()
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
            className={`transition-shadow duration-300 rounded-lg ${isDragging ? "shadow-2xl" : "shadow-lg hover:shadow-2xl"
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
                    className={`bg-gray-100 transition-all duration-300 ${isHovering ? "opacity-100 h-10 border-b border-gray-200 p-2" : "opacity-0 h-0 p-0 overflow-hidden"
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
                            placeholder="输入媒体链接 (Spotify, YouTube, SoundCloud 等)"
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
                        <div className="h-[152px] flex items-center justify-center bg-white rounded-b-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : error ? (
                        <div className="h-[152px] flex flex-col items-center justify-center bg-white rounded-b-lg text-red-500 text-center p-4">
                            <AlertCircle className="h-6 w-6 mb-2" />
                            <p className="text-sm">{error}</p>
                            <p className="text-xs mt-1 text-gray-500">支持: Spotify, YouTube, SoundCloud, Vimeo 链接</p>
                        </div>
                    ) : (
                        iframeSrc && (
                            <div className="overflow-hidden rounded-b-lg">
                                <iframe
                                    src={iframeSrc}
                                    width="100%"
                                    height={embedHeight}
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    className="transform-gpu"
                                />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}

export default MediaContent

