export interface HnArticle {
  id: string;
  link: string;
  title: string;
  createTime: Date;
}

export interface HnArticlePerDayMap {
  articles: Map<string, Array<HnArticle>>;
  count: number;
}
