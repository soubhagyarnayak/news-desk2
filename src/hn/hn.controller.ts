import { Controller, Get, Req, Res, Post, UseGuards } from '@nestjs/common';
import JwtAuthGuard from '../auth/jwt.auth.guard';
import { HnService } from './hn.service';
import { HnArticlePerDayMap } from './hnArticle.interface';
import { HnArticleAnnotationInfo } from './hnArticleAnnotationInfo.interface';
import { HnTag, HnTagDetails } from './hnTag.interface';

@Controller('hn')
@UseGuards(JwtAuthGuard)
export class HnController {
  constructor(private readonly hnService: HnService) {}

  @Get()
  async getHn(@Req() req, @Res() res) {
    const allArticles: HnArticlePerDayMap = await this.hnService.getAll();
    const allTags: HnTag[] = await this.hnService.getAllTags();
    return res.render('hn', {
      articles: allArticles.articles,
      tags: allTags,
      backlogCount: allArticles.count,
    });
  }

  @Get('/archived')
  async getArchived(@Req() req, @Res() res) {
    const allArticles: HnArticlePerDayMap =
      await this.hnService.getAllArchived();
    const allTags: HnTag[] = await this.hnService.getAllTags();
    return res.render('hn', {
      articles: allArticles.articles,
      tags: allTags,
      backlogCount: allArticles.count,
    });
  }

  @Get('/read')
  async getRead(@Req() req, @Res() res) {
    const allArticles: HnArticlePerDayMap = await this.hnService.getAllRead();
    const allTags: HnTag[] = await this.hnService.getAllTags();
    return res.render('hn', {
      articles: allArticles.articles,
      tags: allTags,
      backlogCount: allArticles.count,
    });
  }

  @Post('/')
  async postHn(@Req() req, @Res() res) {
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

  @Get('/article')
  async getHnArticle(@Req() req, @Res() res) {
    const annotationInfo: HnArticleAnnotationInfo =
      await this.hnService.getArticle(req.query.id);
    if (annotationInfo == null) {
      res.status(500).send('Error');
    } else {
      res.status(200).send(annotationInfo);
    }
  }

  @Get('/tags')
  async getTags(@Req() req, @Res() res) {
    const tags: HnTag[] = await this.hnService.getAllTags();
    return res.render('tags', { tags: tags });
  }

  @Get('/tags/:tagId')
  async getTag(@Req() req, @Res() res) {
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
