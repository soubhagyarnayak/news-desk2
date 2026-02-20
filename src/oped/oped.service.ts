// Removed Nest `@Injectable` decorator — plain class
import { OpedArticle } from './opedArticle.interface';
import { OpedCategory, OpedCategoryCollection } from './opedCategory.interface';
import { OpedAnnotation } from './opedAnnotation.interface';
import { ConfigService } from '../config.service';
import { Pool } from 'pg';

export class OpedService {
  private user: string;
  private password: string;
  private host: string;
  private database: string;
  private pool: Pool;

  constructor(config: ConfigService) {
    this.pool = config.getPool();
  }

  async getAll(): Promise<OpedCategoryCollection> {
    const query =
      'SELECT OpEdArticle.Id,OpEdArticle.Link AS href,OpEdArticle.Title,OpEdArticle.PublicationTime,OpEdCategory.Title AS CategoryTitle FROM OpEdArticle JOIN OpEdCategory ON OpEdArticle.CategoryId = OpEdCategory.Id WHERE IsRead IS NULL AND IsRemoved IS NULL ORDER BY PublicationTime DESC';
    const results = await this.pool.query(query);
    const categoriesMap = new Map<string, Array<OpedArticle>>();
    let pending = 0;
    results.rows.forEach(function (row) {
      const article: OpedArticle = {
        id: row['id'],
        link: row['href'],
        title: row['title'],
        pubTime: row['publicationtime'],
      };
      const categoryTitle: string = row['categorytitle'];
      if (!categoriesMap.has(categoryTitle)) {
        categoriesMap.set(categoryTitle, new Array<OpedArticle>());
      }
      categoriesMap.get(categoryTitle).push(article);
      pending++;
    });
    const categories = new Array<OpedCategory>();
    for (const key of categoriesMap.keys()) {
      categories.push({ title: key, articles: categoriesMap.get(key) });
    }
    return { categories: categories, pending: pending };
  }

  async update(query: string, args: Array<string>): Promise<boolean> {
    this.pool.query(query, args, function (err) {
      if (err) {
        console.log(err);
        return false;
      }
    });
    return true;
  }

  async markRead(id: string): Promise<boolean> {
    const query = 'UPDATE OpEdArticle SET isread = true WHERE id = $1';
    const args = [id];
    return await this.update(query, args);
  }

  async remove(id: string): Promise<boolean> {
    const query = 'UPDATE OpEdArticle SET isremoved = true WHERE id =$1';
    const args = [id];
    return await this.update(query, args);
  }

  async annotate(id: string, notes: string, tags: string): Promise<boolean> {
    const query = 'UPDATE OpEdArticle SET tags = $1, notes=$2 WHERE id =$3';
    const args = [tags, notes, id];
    return await this.update(query, args);
  }

  async getArticle(id: string): Promise<OpedAnnotation> {
    const query = 'SELECT tags,notes,description FROM OpEdArticle WHERE id=$1';
    const args = [id];
    let annotationInfo = null;
    const result = await this.pool.query(query, args);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      annotationInfo = {
        tags: row.tags,
        notes: row.notes,
        description: row.description,
      };
    }
    return annotationInfo;
  }
}
