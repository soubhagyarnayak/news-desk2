import { OpedService } from './oped.service';
import { OpedCategoryCollection } from './opedCategory.interface';
import { OpedAnnotation } from './opedAnnotation.interface';

// Legacy Nest controller converted to plain class; Express routes exist in `src/routes/oped.routes.ts`.
export class OpedController {
  constructor(private readonly opedService: OpedService) {}

  async getOped(req: any, res: any) {
    const categories: OpedCategoryCollection = await this.opedService.getAll();
    console.log(categories);
    console.log(categories.pending);
    res.render('oped', {
      categories: categories.categories,
      pending: categories.pending,
    });
  }

  async postHn(req: any, res: any) {
    let result: boolean = false;
    if (req.body.operation == 'markRead') {
      result = await this.opedService.markRead(req.body.id);
    } else if (req.body.operation == 'remove') {
      result = await this.opedService.remove(req.body.id);
    } else if (req.body.operation == 'annotate') {
      result = await this.opedService.annotate(
        req.body.id,
        req.body.notes,
        req.body.tags,
      );
    }
    if (result) {
      res.status(200).send('success');
    } else {
      res.status(400).send('failure');
    }
  }

  async getArticle(req: any, res: any) {
    const annotation: OpedAnnotation = await this.opedService.getArticle(
      req.query.id,
    );
    if (annotation == null) {
      res.status(500).send('Error');
    } else {
      res.status(200).send(annotation);
    }
  }
}
