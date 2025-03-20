import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Share2, Copy, Check } from 'lucide-react';

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    items: any[];
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, items }) => {
    const [shareUrl, setShareUrl] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const uploadFile = async (file: File, type: 'image' | 'audio') => {
        const formData = new FormData();
        formData.append(type, file);

        const response = await fetch(`http://localhost:5001/api/upload/${type}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('文件上传失败');
        }

        const data = await response.json();
        return data.url;
    };

    const handleShare = async () => {
        try {
            setIsLoading(true);

            // 处理所有需要上传的文件
            const processedItems = await Promise.all(
                items.map(async (item) => {
                    const processedItem = { ...item };

                    // 处理图片
                    if (item.type === 'photo' && item.data.imageUrl) {
                        const response = await fetch(item.data.imageUrl);
                        const blob = await response.blob();
                        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
                        const url = await uploadFile(file, 'image');
                        processedItem.data = { ...item.data, imageUrl: url };
                    }

                    // 处理音频
                    if (item.type === 'audio' && item.data.audioUrl) {
                        const response = await fetch(item.data.audioUrl);
                        const blob = await response.blob();
                        const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
                        const url = await uploadFile(file, 'audio');
                        processedItem.data = { ...item.data, audioUrl: url };
                    }

                    // 处理便签
                    if (item.type === 'note') {
                        processedItem.data = {
                            ...item.data,
                            content: item.data.content || '',
                            color: item.data.color || 'yellow'
                        };
                    }

                    // 处理涂鸦
                    if (item.type === 'doodle') {
                        processedItem.data = {
                            ...item.data,
                            svgData: item.data.svgData || ''
                        };
                    }

                    // 处理 Spotify
                    if (item.type === 'spotify') {
                        processedItem.data = {
                            ...item.data,
                            spotifyUrl: item.data.spotifyUrl || ''
                        };
                    }

                    return processedItem;
                })
            );

            // 创建分享
            const response = await fetch('http://localhost:5001/api/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: processedItems }),
            });

            if (!response.ok) {
                throw new Error('分享失败');
            }

            const data = await response.json();
            const url = `${window.location.origin}/share/${data.shareId}`;
            setShareUrl(url);
        } catch (error) {
            console.error('分享失败:', error);
            alert('分享失败，请重试');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('复制失败:', error);
            alert('复制失败，请重试');
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                        分享你的作品
                    </Dialog.Title>

                    {!shareUrl ? (
                        <button
                            onClick={handleShare}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                '生成分享链接...'
                            ) : (
                                <>
                                    <Share2 className="w-4 h-4" />
                                    生成分享链接
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 bg-transparent text-sm text-gray-600"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                    {isCopied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">
                                分享链接将在7天后过期
                            </p>
                        </div>
                    )}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}; 