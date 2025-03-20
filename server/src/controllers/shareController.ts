import { Request, Response } from 'express';
import { Share } from '../models/Share';
import { v4 as uuidv4 } from 'uuid';

export const createShare = async (req: Request, res: Response) => {
    try {
        const { items, customPath } = req.body;
        console.log('Creating share with items:', JSON.stringify(items, null, 2));

        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('Invalid items data:', items);
            return res.status(400).json({ message: '无效的项目数据' });
        }

        // 验证自定义路径
        if (customPath) {
            if (!/^[a-zA-Z0-9-_]+$/.test(customPath) || customPath.length < 3) {
                return res.status(400).json({ message: '自定义链接只能包含字母、数字、下划线和连字符，且至少需要3个字符' });
            }

            // 检查自定义路径是否已存在
            const existingShare = await Share.findOne({ shareId: customPath });
            if (existingShare) {
                return res.status(400).json({ message: '该自定义链接已被使用' });
            }
        }

        const shareId = customPath || uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

        const share = new Share({
            shareId,
            items: items.map(item => ({
                ...item,
                data: {
                    ...item.data,
                    color: item.type === 'note' ? (item.data.color || 'yellow') : item.data.color,
                    content: item.type === 'note' ? (item.data.content || '') : item.data.content
                }
            })),
            expiresAt,
        });

        console.log('Saving share to database:', {
            shareId,
            itemCount: items.length,
            items: items.map(item => ({
                type: item.type,
                data: item.data
            })),
            expiresAt
        });

        await share.save();
        console.log('Share saved successfully:', shareId);
        res.status(201).json({ shareId });
    } catch (error: any) {
        console.error('创建分享失败:', error);
        res.status(500).json({ message: '创建分享失败', error: error.message });
    }
};

export const getShare = async (req: Request, res: Response) => {
    try {
        const { shareId } = req.params;
        console.log('Fetching share:', shareId);

        const share = await Share.findOne({ shareId });
        console.log('Share found:', share ? 'yes' : 'no');

        if (!share) {
            console.log('Share not found:', shareId);
            return res.status(404).json({ message: '分享不存在' });
        }

        if (new Date() > share.expiresAt) {
            console.log('Share expired:', shareId);
            await Share.deleteOne({ shareId });
            return res.status(404).json({ message: '分享已过期' });
        }

        console.log('Returning share data:', {
            shareId,
            itemCount: share.items.length,
            items: share.items.map(item => ({
                type: item.type,
                data: item.data
            }))
        });

        res.json({ items: share.items });
    } catch (error: any) {
        console.error('获取分享失败:', error);
        res.status(500).json({ message: '获取分享失败', error: error.message });
    }
}; 