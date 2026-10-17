export interface StockMetadata {
  id: number;
  name: string;
  symbol: string;
  country?: string;
  value?: number;
  variation?: number;
  lastUpdateTime?: Date;
  lastRefreshedTime?: Date;
  link?: string;
}
