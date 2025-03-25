'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { GridBackground } from '@/components/GridBackground';
import { DraggableItem } from '@/components/DraggableItem';
import { PolaroidContent } from '@/components/PolaroidContent';
import { NoteContent } from '@/components/NoteContent';
import MediaContent from '@/components/MediaContent';
import { DoodleContent } from '@/components/DoodleContent';
import { AudioContent } from '@/components/AudioContent';

interface Item {
    id: string;
    position: { x: number; y: number };
    zIndex: number;
    rotation: number;
    type: 'photo' | 'note' | 'media' | 'doodle' | 'audio';
    data: {
        imageUrl?: string;
        dateTaken?: string;
        color?: string;
        content?: string;
        audioUrl?: string;
        spotifyUrl?: string;
        svgData?: string;
    };
}

export default function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
    const { shareId } = use(params);
    const [items, setItems] = useState<Item[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [highestZIndex, setHighestZIndex] = useState(10);

    useEffect(() => {
        const fetchShare = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/from/${shareId}`);
                if (!response.ok) {
                    throw new Error('分享不存在或已过期');
                }
                const data = await response.json();

                // 处理文件URL
                const processedItems = data.items.map((item: Item) => {
                    const processedItem = { ...item };

                    // 处理图片URL
                    if (item.type === 'photo' && item.data.imageUrl) {
                        processedItem.data = {
                            ...item.data,
                            imageUrl: item.data.imageUrl.startsWith('http')
                                ? item.data.imageUrl
                                : `http://localhost:5001${item.data.imageUrl}`
                        };
                    }

                    // 处理音频URL
                    if (item.type === 'audio' && item.data.audioUrl) {
                        processedItem.data = {
                            ...item.data,
                            audioUrl: item.data.audioUrl.startsWith('http')
                                ? item.data.audioUrl
                                : `http://localhost:5001${item.data.audioUrl}`
                        };
                    }

                    // 处理便签内容
                    if (item.type === 'note') {
                        processedItem.data = {
                            ...item.data,
                            content: item.data.content || '',
                            color: item.data.color || 'yellow'
                        };
                    }

                    return processedItem;
                });

                setItems(processedItems);
            } catch (error) {
                console.error('获取分享失败:', error);
                setError(error instanceof Error ? error.message : '获取分享失败');
            }
        };

        fetchShare();
    }, [shareId]);

    const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
        setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, position: newPosition } : item)));
    };

    const handleDragStart = (id: string) => {
        const newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);
        setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, zIndex: newZIndex } : item)));
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">出错了</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <GridBackground />
            <div className="absolute inset-0 z-0 overflow-hidden">
                {items.map((item) => (
                    <DraggableItem
                        key={item.id}
                        id={item.id}
                        initialPosition={item.position}
                        zIndex={item.zIndex}
                        rotation={item.rotation}
                        onPositionChange={handlePositionChange}
                        onDragStart={handleDragStart}
                    >
                        {item.type === 'photo' ? (
                            <PolaroidContent
                                imageUrl={item.data.imageUrl || ''}
                                dateTaken={item.data.dateTaken}
                            />
                        ) : item.type === 'note' ? (
                            <NoteContent
                                color={item.data.color || 'yellow'}
                                content={item.data.content || ''}
                                onBringToFront={() => handleDragStart(item.id)}
                            />
                        ) : item.type === 'media' ? (
                            <MediaContent
                                initialUrl={item.data.spotifyUrl}
                            />
                        ) : item.type === 'doodle' ? (
                            <DoodleContent
                                svgData={item.data.svgData || ''}
                            />
                        ) : (
                            <AudioContent
                                audioUrl={item.data.audioUrl || ''}
                            />
                        )}
                    </DraggableItem>
                ))}
            </div>
        </div>
    );
} 