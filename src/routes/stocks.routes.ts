import { Router } from 'express';
import { join } from 'path';
import { ConfigService } from '../config.service';
import { StocksService } from '../stocks/stocks.service';

const router = Router();

const config = new ConfigService(join(__dirname, '..', '..', '.env'));
const stocksService = new StocksService(config);

stocksService.init().catch(err => console.error('Failed to initialise StockMetadata table:', err));

router.post('/:id/refresh', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const stock = await stocksService.refreshStock(id);
  if (!stock) {
    return res.status(500).json({ error: 'Failed to refresh stock' });
  }
  res.status(200).json(stock);
});

export default router;
