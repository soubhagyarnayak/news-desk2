import { HnService } from './hn.service';
import { HnArticlePerDayMap } from './hnArticle.interface';
import { HnArticleAnnotationInfo } from './hnArticleAnnotationInfo.interface';
import { HnTag, HnTagDetails } from './hnTag.interface';

export class HnController {
  constructor(private readonly hnService: HnService) {}

  async getHn(req: any, res: any) {
    const allArticles: HnArticlePerDayMap = await this.hnService.getAll();
    const allTags: HnTag[] = await this.hnService.getAllTags();
    return res.render('hn', {
      articles: allArticles.articles,
      tags: allTags,
      backlogCount: allArticles.count,
    });
  }

  async getArchived(req: any, res: any) {
    const allArticles: HnArticlePerDayMap =
      await this.hnService.getAllArchived();
    const allTags: HnTag[] = await this.hnService.getAllTags();
    return res.render('hn', {
      articles: allArticles.articles,
      tags: allTags,
      backlogCount: allArticles.count,
    });
  }

  async getRead(req: any, res: any) {
    const allArticles: HnArticlePerDayMap = await this.hnService.getAllRead();
    const allTags: HnTag[] = await this.hnService.getAllTags();
    return res.render('hn', {
      articles: allArticles.articles,
      tags: allTags,
      backlogCount: allArticles.count,
    });
  }

  async postHn(req: any, res: any) {
    let query = null;
    let args = [];
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
    const result: boolean = await this.hnService.update(query, args);
    if (result) {
      res.status(200).send('success');
    } else {
      res.status(400).send('failure');
    }
  }

  async getHnArticle(req: any, res: any) {
    const annotationInfo: HnArticleAnnotationInfo =
      await this.hnService.getArticle(req.query.id);
    if (annotationInfo == null) {
      res.status(500).send('Error');
    } else {
      res.status(200).send(annotationInfo);
    }
  }

  async getTags(req: any, res: any) {
    const tags: HnTag[] = await this.hnService.getAllTags();
    return res.render('tags', { tags: tags });
  }

  async getTag(req: any, res: any) {
    const hnTagDetails: HnTagDetails = await this.hnService.getTagDetails(
      req.params.tagId,
    );
    return res.render('tag', {
      articles: hnTagDetails.articles,
      tag: hnTagDetails.tag.tag,
      tagId: hnTagDetails.tag.id,
      description: hnTagDetails.tag.description,
    });
  }
}
