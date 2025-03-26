import React, { useState, useEffect } from 'react'
import { Search, Music, Loader2, ExternalLink } from 'lucide-react'

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
    const [inputUrl, setInputUrl] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
    const [recommendedTracks, setRecommendedTracks] = useState<SpotifyTrack[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [accessToken, setAccessToken] = useState('')
    const [error, setError] = useState('')
    const [fallbackMode, setFallbackMode] = useState(false)

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
                setError('无法连接到Spotify服务，使用离线模式')
                setFallbackMode(true)
                loadSampleTracks()
            } finally {
                setIsLoading(false)
            }
        }

        getSpotifyToken()
    }, [])

    // 获取推荐热门歌曲
    const fetchRecommendedTracks = async (token: string) => {
        try {
            // 设置要搜索的华语歌手
            const artists = ['周杰伦', '林俊杰', '陈奕迅', '薛之谦', 'G.E.M.', '五月天', '李荣浩', '周深', '张韶涵', '范玮琪']
            const searchPromises = artists.map(artist =>
                fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=track&limit=1&market=TW`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(res => res.json())
            )

            const searchResults = await Promise.all(searchPromises)
            const tracks = searchResults
                .map(result => result.tracks?.items?.[0])
                .filter(track => track != null)

            if (tracks.length === 0) {
                throw new Error('无法获取推荐歌曲')
            }

            setRecommendedTracks(tracks)
            setError('')
        } catch (err) {
            console.error('获取推荐歌曲失败:', err)
            setError('无法加载推荐歌曲，使用离线数据')
            setFallbackMode(true)
            loadSampleTracks()
        }
    }

    // 加载备用示例数据
    const loadSampleTracks = async () => {
        try {
            // 这些是热门华语歌曲的Spotify ID示例
            const topTrackIds = [
                '6fCpZU76MwKF2TMsgwwhQj', // 周杰伦 - 稻香
                '61IWmntLyAepKu0C7Wmmkf', // 林俊杰 - 那些你很冒险的梦
                '3XkYvlvE8LVQkQbZfKeAGu', // 陈奕迅 - 十年
                '5YbZZ2gYfvW7B5MdKxaUjN', // 薛之谦 - 演员
                '12V0KAE3Xm8TqnP4RnW8Bn', // 邓紫棋 - 光年之外
                '2iVQNJM9rnDqK3Ul91CGQJ', // 五月天 - 倔强
                '1PgTc4ImQHT8r74YiS5Vxm', // 李荣浩 - 李白
                '0U5tGQxJxBNdjTxrY5xPqP', // 周深 - 大鱼
                '1qLLA6KvZgvAlpTL6M7Lk3', // 张韶涵 - 阿刁
                '4QBWVezKh1sSzSgS4uiSfD'  // 范玮琪 - 一千个可能
            ]

            // 真实专辑封面URL
            const albumCovers = [
                'https://i.scdn.co/image/ab67616d0000b273b3f9a75e2c7da4b641d8c34c', // 魔杰座
                'https://i.scdn.co/image/ab67616d0000b2738510a390a05b9fe8c2ac5125', // JJ陆
                'https://i.scdn.co/image/ab67616d0000b27326b7dd89810cc1a40ada642c', // 十年
                'https://i.scdn.co/image/ab67616d0000b273b91a6f7b2cda6df7c409b92c', // 绅士
                'https://i.scdn.co/image/ab67616d0000b2731eb3ecabe59fd966ccca6b86', // 新的心跳
                'https://i.scdn.co/image/ab67616d0000b273c146967e005a31d7d2e4f5f1', // 神的孩子都在跳舞
                'https://i.scdn.co/image/ab67616d0000b273af5c2b3f6c36f96a9a93fb60', // 李白
                'https://i.scdn.co/image/ab67616d0000b273a2ef896cd18cf13d2947db7f', // 大鱼
                'https://i.scdn.co/image/ab67616d0000b2731805f8ea212a36b8fbce7ca7', // 阿刁
                'https://i.scdn.co/image/ab67616d0000b2734b2b3913729819a1099bb1e0'  // 一千个可能
            ]

            // 构造示例数据
            const sampleTracks: SpotifyTrack[] = topTrackIds.map((id, index) => ({
                id,
                name: ['稻香', '那些你很冒险的梦', '十年', '演员', '光年之外', '倔强', '李白', '大鱼', '阿刁', '一千个可能'][index],
                artists: [{ name: ['周杰伦', '林俊杰', '陈奕迅', '薛之谦', '邓紫棋', '五月天', '李荣浩', '周深', '张韶涵', '范玮琪'][index] }],
                album: {
                    name: ['魔杰座', 'JJ陆', '十年', '绅士', '新的心跳', '神的孩子都在跳舞', '李白', '大鱼', '阿刁', '一千个可能'][index],
                    images: [{ url: albumCovers[index] }]
                },
                external_urls: {
                    spotify: `https://open.spotify.com/track/${id}`
                }
            }))

            setRecommendedTracks(sampleTracks)
            setError('使用离线数据中')
        } catch (err) {
            console.error('加载示例歌曲失败:', err)
            setError('无法加载任何歌曲数据')
        } finally {
            setIsLoading(false)
        }
    }

    // 搜索歌曲
    const searchTracks = async () => {
        if (!searchQuery.trim()) return

        try {
            setIsSearching(true)
            setError('')

            if (fallbackMode) {
                // 离线模式下的模拟搜索
                const mockResults = recommendedTracks
                    .filter(track =>
                        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        track.artists.some(artist =>
                            artist.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                    )

                setSearchResults(mockResults)

                if (mockResults.length === 0) {
                    setError('无搜索结果，请尝试其他关键词')
                }

                return
            }

            // 在线模式使用真实API
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10&market=TW`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            )

            if (!response.ok) {
                throw new Error('搜索歌曲失败')
            }

            const data = await response.json()
            setSearchResults(data.tracks.items)

            if (data.tracks.items.length === 0) {
                setError('无搜索结果，请尝试其他关键词')
            }
        } catch (err) {
            console.error('搜索歌曲失败:', err)

            // 出错时回退到离线搜索
            const mockResults = recommendedTracks
                .filter(track =>
                    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    track.artists.some(artist =>
                        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                )

            setSearchResults(mockResults)

            if (mockResults.length === 0) {
                setError('无搜索结果，请尝试其他关键词')
            } else {
                setError('使用离线搜索结果')
            }
        } finally {
            setIsSearching(false)
        }
    }

    // 处理搜索表单提交
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        searchTracks()
    }

    // 处理直接输入URL
    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputUrl.trim()) {
            onSave(inputUrl.trim())
        }
    }

    // 选择一首歌曲
    const selectTrack = (track: SpotifyTrack) => {
        onSave(track.external_urls.spotify)
    }

    // 渲染歌曲列表项
    const renderTrackItem = (track: SpotifyTrack) => (
        <div
            key={track.id}
            className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => selectTrack(track)}
        >
            <div className="flex-shrink-0 w-12 h-12 mr-3">
                {track.album.images[0]?.url ? (
                    <img
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        className="w-full h-full object-cover rounded"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <Music size={18} className="text-gray-400" />
                    </div>
                )}
            </div>
            <div className="flex-grow min-w-0">
                <div className="font-medium text-gray-900 truncate">{track.name}</div>
                <div className="text-xs text-gray-500 truncate">
                    {track.artists.map(artist => artist.name).join(', ')}
                </div>
            </div>
            <div className="flex-shrink-0 ml-2">
                <ExternalLink size={16} className="text-gray-400" />
            </div>
        </div>
    )

    return (
        <div className="absolute inset-0 w-full h-full flex flex-col p-4">
            <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-lg shadow-lg flex flex-col h-full">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-medium text-center mb-2 text-gray-800">添加音乐</h2>

                    {fallbackMode && (
                        <div className="mb-2 py-1 px-3 bg-yellow-100 text-yellow-800 text-sm rounded">
                            Spotify API连接受限，使用离线数据
                        </div>
                    )}

                    {/* Spotify搜索栏 */}
                    <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="搜索歌曲、艺术家..."
                                className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            搜索
                        </button>
                    </form>

                    {/* 直接输入URL */}
                    <form onSubmit={handleUrlSubmit} className="flex items-center">
                        <input
                            type="text"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            placeholder="或直接输入Spotify链接..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                        />
                    </form>
                </div>

                {/* 搜索结果和推荐部分 */}
                <div className="flex-grow overflow-auto bg-white/5 backdrop-blur-sm">
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
                        <div className="p-4">
                            <h3 className="font-medium text-gray-700 mb-2">
                                搜索结果
                                {error && <span className="text-xs text-orange-500 ml-2">({error})</span>}
                            </h3>
                            <div className="bg-white rounded-lg overflow-hidden">
                                {searchResults.map(renderTrackItem)}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4">
                            <h3 className="font-medium text-gray-700 mb-2">
                                热门推荐
                                {error && <span className="text-xs text-orange-500 ml-2">({error})</span>}
                            </h3>
                            <div className="bg-white rounded-lg overflow-hidden">
                                {recommendedTracks.map(renderTrackItem)}
                            </div>
                        </div>
                    )}
                </div>

                {/* 底部按钮 */}
                <div className="p-4 border-t border-gray-200 flex justify-center">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-gray-700 hover:bg-white/30 transition-colors mr-4"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        onClick={handleUrlSubmit}
                        disabled={!inputUrl.trim()}
                        className={`px-6 py-2 rounded-full ${inputUrl.trim()
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-blue-300 text-white cursor-not-allowed'
                            } transition-colors`}
                    >
                        添加链接
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MediaInputPanel 