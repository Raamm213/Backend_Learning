import { Router } from 'express';
import { healthcheck } from '../controllers/healthcheck.controller.js';
import { get } from 'mongoose';

const router = Router();

router.get('/', healthcheck);
router.route('/').get(healthcheck);
export default router;
