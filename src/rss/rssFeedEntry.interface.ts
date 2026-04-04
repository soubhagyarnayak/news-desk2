export interface RssFeedEntry {
  id: number;
  feedId: number;
  feedTitle: string;
  title: string;
  link: string;
  description?: string;
  publicationDate?: string;
  tags?: string;
  notes?: string;
}

export interface RssFeedEntriesResult {
  entries: Map<string, RssFeedEntry[]>;
  count: number;
}
