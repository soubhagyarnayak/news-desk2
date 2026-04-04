import { Router } from 'express';
import { join } from 'path';
import { ConfigService } from '../config.service';
import { RssService } from '../rss/rss.service';

const router = Router();

const config = new ConfigService(join(__dirname, '..', '..', '.env'));
const rssService = new RssService(config);

rssService.init().catch(err => console.error('Failed to initialise RSSFeedMetadata table:', err));

router.get('/', async (req, res) => {
  try {
    const feeds = await rssService.getAllFeeds();
    res.render('rss', { feeds });
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    res.status(500).send('Error fetching feeds');
  }
});

router.post('/', async (req, res) => {
  const { url, title, description } = req.body;
  if (!url || !title) {
    return res.status(400).json({ error: 'url and title are required' });
  }
  try {
    const feed = await rssService.createFeed(url, title, description);
    res.status(201).json(feed);
  } catch (error) {
    console.error('Error creating RSS feed:', error);
    res.status(500).json({ error: 'Failed to create feed' });
  }
});

router.post('/refresh', async (req, res) => {
  const feedId = parseInt(req.body.feedId, 10);
  if (isNaN(feedId)) {
    return res.status(400).json({ error: 'Invalid feedId' });
  }
  const result = await rssService.enqueueFeedRefresh(feedId);
  if (result) {
    res.status(200).send();
  } else {
    res.status(500).send();
  }
});

export default router;
