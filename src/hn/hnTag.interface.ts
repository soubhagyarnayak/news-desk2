import { HnArticle } from './hnArticle.interface';

export interface HnTag {
  id: string;
  tag: string;
  description: string;
}

export interface HnTagDetails {
  tag: HnTag;
  articles: HnArticle[];
}
