import { Router } from 'express';
import passport = require('passport');
import { join } from 'path';
import { ConfigService } from '../config.service';
import { HnService } from '../hn/hn.service';
import { HnTagDetails } from '../hn/hnTag.interface';

const router = Router();

const config = new ConfigService(join(__dirname, '..', '..','.env'));
const hnService = new HnService(config);

// protect all hn routes with JWT
//router.use(passport.authenticate('jwt', { session: false }));

router.get('/', async (req, res) => {
  const allArticles = await hnService.getAll();
  const allTags = await hnService.getAllTags();
  return res.render('hn', {
    articles: allArticles.articles,
    tags: allTags,
    backlogCount: allArticles.count,
  });
});

router.get('/archived', async (req, res) => {
  const allArticles = await hnService.getAllArchived();
  const allTags = await hnService.getAllTags();
  return res.render('hn', {
    articles: allArticles.articles,
    tags: allTags,
    backlogCount: allArticles.count,
  });
});

router.get('/read', async (req, res) => {
  const allArticles = await hnService.getAllRead();
  const allTags = await hnService.getAllTags();
  return res.render('hn', {
    articles: allArticles.articles,
    tags: allTags,
    backlogCount: allArticles.count,
  });
});

router.post('/', async (req, res) => {
  let query: string | undefined = undefined;
  let args: any[] = [];
  if (req.body.operation == 'markRead') {
    query = 'UPDATE hackernewsarticles SET isread = true WHERE id = $1';
    args = [req.body.id];
  } else if (req.body.operation == 'remove') {
    query = 'UPDATE hackernewsarticles SET isremoved = true WHERE id =$1';
    args = [req.body.id];
  } else if (req.body.operation == 'annotate') {
    query = 'UPDATE hackernewsarticles SET tags = $1, notes=$2 WHERE id =$3';
    args = [req.body.tags, req.body.notes, req.body.id];
  }

  if (!query) {
    res.status(400).send('Invalid operation');
    return;
  }

  const result: boolean = await hnService.update(query, args);
  if (result) {
    res.status(200).send('success');
  } else {
    res.status(400).send('failure');
  }
});

router.get('/article', async (req, res) => {
  const annotationInfo = await hnService.getArticle(req.query.id as string);
  if (annotationInfo == null) {
    res.status(500).send('Error');
  } else {
    res.status(200).send(annotationInfo);
  }
});

router.get('/tags', async (req, res) => {
  const tags = await hnService.getAllTags();
  return res.render('tags', { tags: tags });
});

router.get('/tags/:tagId', async (req, res) => {
  const hnTagDetails: HnTagDetails|undefined = await hnService.getTagDetails(req.params.tagId);
  if (!hnTagDetails) {
    res.status(404).send('Tag not found');
    return;
  }
  return res.render('tag', {
    articles: hnTagDetails.articles,
    tag: hnTagDetails.tag.tag,
    tagId: hnTagDetails.tag.id,
    description: hnTagDetails.tag.description,
  });
});

export default router;
