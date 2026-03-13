import { Router } from 'express';
import { SystemSettings } from './system-settings.model';
import { logger } from '../../config/logger';

const router: Router = Router();

// GET /api/system/settings/:key
router.get('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await SystemSettings.findOne({ key });

    if (!setting) {
      return res.status(404).json({ error: `Setting ${key} not found` });
    }

    res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    logger.error('Error fetching system setting: ' + (error as Error).message);
    res.status(500).json({ error: 'Failed to fetch system setting' });
  }
});

// GET /api/system/settings
// Returns all public system settings as a key-value map
router.get('/settings', async (req, res) => {
  try {
    const settings = await SystemSettings.find({});
    const map = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json({ settings: map });
  } catch (error) {
    logger.error('Error fetching system settings: ' + (error as Error).message);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

export default router;
