import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 配置文件存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// 上传图片
router.post('/image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '没有上传文件' });
    }
    const fileUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// 上传音频
router.post('/audio', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '没有上传文件' });
    }
    const fileUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

export default router; 