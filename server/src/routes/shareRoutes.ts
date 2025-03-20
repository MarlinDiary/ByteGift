import express from 'express';
import { createShare, getShare } from '../controllers/shareController';

const router = express.Router();

router.post('/', createShare);
router.get('/:shareId', getShare);

export default router; 