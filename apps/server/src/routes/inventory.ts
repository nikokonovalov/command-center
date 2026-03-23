import { Router } from 'express';
import type { ApiResponse, AIUseCaseItem } from '@command-center/types';
import { inventory } from '../mocks/inventory.js';

const router: Router = Router();

// Return all inventory items (client handles filtering/pagination)
router.get('/api/inventory', (_req, res) => {
    const response: ApiResponse<AIUseCaseItem[]> = {
        data: inventory,
        meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
});

export default router;
