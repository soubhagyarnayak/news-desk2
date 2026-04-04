import { Router } from 'express';
import { join } from 'path';
import { ConfigService } from '../config.service';
import { RssService } from '../rss/rss.service';

const router = Router();

const config = new ConfigService(join(__dirname, '..', '..', '.env'));
const rssService = new RssService(config);

rssService.init().catch(err => console.error('Failed to initialise RSS tables:', err));

// ── Feed management ──────────────────────────────────────────────────────────

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

// ── Entry management ─────────────────────────────────────────────────────────

router.get('/entries', async (req, res) => {
  try {
    const { entries, count } = await rssService.getEntries();
    res.render('rss-entries', { entries, backlogCount: count });
  } catch (error) {
    console.error('Error fetching RSS entries:', error);
    res.status(500).send('Error fetching entries');
  }
});

router.get('/entries/entry', async (req, res) => {
  const entry = await rssService.getEntry(req.query.id as string);
  if (entry == null) {
    res.status(500).send('Error');
  } else {
    res.status(200).json(entry);
  }
});

router.post('/entries', async (req, res) => {
  const { operation, id } = req.body;
  let result = false;
  if (operation === 'markRead') {
    result = await rssService.markEntryRead(id);
  } else if (operation === 'remove') {
    result = await rssService.removeEntry(id);
  } else if (operation === 'annotate') {
    result = await rssService.annotateEntry(id, req.body.tags, req.body.notes);
  }
  res.status(result ? 200 : 400).send(result ? 'success' : 'failure');
});

export default router;
