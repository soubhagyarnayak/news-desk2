import { Injectable } from '@nestjs/common';
import { HnArticle } from './hnArticle.interface';
import { ConfigService } from '../config.service';
import { Pool } from 'pg';

@Injectable()
export class HnService {
    private user: string;
    private password: string;
    private host: string;
    private database: string;
    constructor(config: ConfigService) {
        this.user = config.get('DB_USER');
        this.password = config.get('DB_PASSWORD');
        this.host = config.get('DB_HOST');
        this.database = config.get('DB_DATABASE');
    }
    async getAll(): Promise<HnArticle[]> { 
        const pool = new Pool( {
            user: this.user,
            password: this.password,
            host: this.host,
            database: this.database,
        });
        let results = await pool.query("SELECT id,link as href,title FROM hackernewsarticles WHERE isread IS NULL AND isremoved IS NULL ORDER BY CreateTime DESC");
        let articles = new Array<HnArticle>();
        results.rows.forEach(function(row){
            let article:HnArticle  = {id:row["id"], link:row["href"], title:row["title"]};
            articles.push(article);
        });
        return articles;
    }
}