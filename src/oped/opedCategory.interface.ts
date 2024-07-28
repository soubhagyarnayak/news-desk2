import { OpedArticle } from './opedArticle.interface';

export interface OpedCategory {
  title: string;
  articles: Array<OpedArticle>;
}

export interface OpedCategoryCollection {
  categories: Array<OpedCategory>;
  pending: number;
}
