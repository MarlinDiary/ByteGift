import React, { useState, useEffect } from 'react'
import { Search, Music, Loader2, ExternalLink, X } from 'lucide-react'

// Spotify API相关配置
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || ''
const SPOTIFY_CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || ''

// 歌曲接口定义
interface SpotifyTrack {
    id: string
    name: string
    artists: { name: string }[]
    album: {
        name: string
        images: { url: string }[]
    }
    external_urls: {
        spotify: string
    }
}

interface MediaInputPanelProps {
    onSave: (url: string) => void
    onCancel: () => void
}

export const MediaInputPanel: React.FC<MediaInputPanelProps> = ({ onSave, onCancel }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
    const [recommendedTracks, setRecommendedTracks] = useState<SpotifyTrack[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [accessToken, setAccessToken] = useState('')
    const [error, setError] = useState('')

    // 获取Spotify访问令牌
    useEffect(() => {
        const getSpotifyToken = async () => {
            try {
                setIsLoading(true)
                const response = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
                    },
                    body: 'grant_type=client_credentials'
                })

                if (!response.ok) {
                    throw new Error('无法获取Spotify访问令牌')
                }

                const data = await response.json()
                setAccessToken(data.access_token)

                // 获取令牌后加载推荐歌曲
                fetchRecommendedTracks(data.access_token)
            } catch (err) {
                console.error('获取Spotify令牌出错:', err)
                setError('无法连接到Spotify服务，请检查您的网络连接或API凭证')
            } finally {
                setIsLoading(false)
            }
        }

        getSpotifyToken()
    }, [])

    // 获取推荐热门歌曲
    const fetchRecommendedTracks = async (token: string) => {
        try {
            // 直接获取全球热门歌曲
            const response = await fetch(
                'https://api.spotify.com/v1/browse/new-releases?limit=50',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (!response.ok) {
                throw new Error('获取热门歌曲失败: ' + response.statusText)
            }

            const data = await response.json()

            if (!data.albums?.items || data.albums.items.length === 0) {
                throw new Error('未找到热门歌曲')
            }

            // 转换专辑格式为歌曲格式，以适应界面显示
            const albumsAsTrack = data.albums.items.map((album: any) => ({
                id: album.id,
                name: album.name,
                artists: album.artists || [{ name: "未知艺术家" }],
                album: {
                    name: album.name,
                    images: album.images || [{ url: "" }]
                },
                external_urls: {
                    spotify: album.external_urls?.spotify || `https://open.spotify.com/album/${album.id}`
                }
            }))

            // 验证数据的完整性
            const validTracks = albumsAsTrack.filter((track: any) => {
                return track &&
                    track.id &&
                    track.name &&
                    track.artists &&
                    track.artists.length > 0 &&
                    track.album &&
                    track.album.images &&
                    track.album.images.length > 0 &&
                    track.external_urls &&
                    track.external_urls.spotify
            })

            if (validTracks.length === 0) {
                throw new Error('未找到有效的歌曲数据')
            }

            setRecommendedTracks(validTracks)
            setError('')
        } catch (err) {
            console.error('获取推荐歌曲失败:', err)
            setError('无法加载热门歌曲，请稍后重试')
        }
    }

    // 搜索歌曲
    const searchTracks = async () => {
        if (!searchQuery.trim() || !accessToken) return

        try {
            setIsSearching(true)
            setError('')

            // 使用真实API
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=50`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            )

            if (!response.ok) {
                throw new Error('搜索歌曲失败: ' + response.statusText)
            }

            const data = await response.json()

            if (!data.tracks?.items) {
                throw new Error('搜索返回的数据格式错误')
            }

            // 验证歌曲数据的完整性
            const validTracks = data.tracks.items.filter((track: any) => {
                return track &&
                    track.id &&
                    track.name &&
                    track.artists &&
                    track.artists.length > 0 &&
                    track.album &&
                    track.album.images &&
                    track.album.images.length > 0 &&
                    track.external_urls &&
                    track.external_urls.spotify
            })

            setSearchResults(validTracks)

            if (validTracks.length === 0) {
                setError('无搜索结果，请尝试其他关键词')
            }
        } catch (err) {
            console.error('搜索歌曲失败:', err)
            setError('搜索歌曲时出错，请稍后再试')
        } finally {
            setIsSearching(false)
        }
    }

    // 处理输入变化，自动触发搜索
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)

        // 使用防抖，在输入停止300ms后才发起搜索请求
        const debounceSearch = setTimeout(() => {
            if (value.trim()) {
                searchTracks()
            } else if (value === '') {
                // 如果输入框清空，显示推荐内容
                setSearchResults([])
            }
        }, 300)

        return () => clearTimeout(debounceSearch)
    }

    // 选择一首歌曲
    const selectTrack = (track: SpotifyTrack) => {
        onSave(track.external_urls.spotify)
    }

    // 渲染歌曲网格项
    const renderTrackItem = (track: SpotifyTrack) => {
        // 安全检查，确保所有必要属性都存在
        if (!track || !track.id || !track.name || !track.artists ||
            !track.album || !track.album.images || !track.album.images[0] ||
            !track.external_urls || !track.external_urls.spotify) {
            console.warn('发现无效的歌曲数据:', track)
            return null
        }

        return (
            <div
                key={track.id}
                className="flex items-center bg-gray-100 hover:bg-gray-200 rounded overflow-hidden cursor-pointer transition-all duration-200"
                onClick={() => selectTrack(track)}
            >
                <div className="w-10 h-10 flex-shrink-0">
                    {track.album.images[0]?.url ? (
                        <img
                            src={track.album.images[0].url}
                            alt={track.album.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Music size={16} className="text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="flex-grow min-w-0 px-2 py-1">
                    <div className="font-medium text-gray-800 text-xs truncate">{track.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                        {track.artists.map(artist => artist.name).join(', ')}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="absolute inset-0 w-full h-full flex flex-col p-4">
            {/* 顶部搜索栏和关闭按钮 */}
            <div className="flex items-center w-full max-w-4xl mx-auto my-2">
                {/* 关闭按钮 */}
                <button
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
                    onClick={onCancel}
                    aria-label="关闭"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* 搜索输入框 */}
                <div className="relative flex-grow ml-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        placeholder="搜索歌曲、艺术家..."
                        className="w-full p-2 pl-9 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-500"
                    />
                    <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
            </div>

            {/* 搜索结果和推荐部分 */}
            <div className="flex-grow w-full max-w-4xl mx-auto overflow-auto mt-2">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : error && searchResults.length === 0 && recommendedTracks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-red-500">
                        <p>{error}</p>
                    </div>
                ) : isSearching ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {searchResults.map(track => renderTrackItem(track)).filter(Boolean)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {recommendedTracks.map(track => renderTrackItem(track)).filter(Boolean)}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MediaInputPanel 