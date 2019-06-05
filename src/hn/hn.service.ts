import { Injectable } from '@nestjs/common';
import { HnArticle } from './hnArticle.interface';
import { HnArticleAnnotationInfo } from './hnArticleAnnotationInfo.interface';
import { ConfigService } from '../config.service';
import { Pool } from 'pg';
import { HnTag, HnTagDetails } from './hnTag.interface';

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
        const pool = this.getPool();
        let results = await pool.query("SELECT id,link as href,title FROM hackernewsarticles WHERE isread IS NULL AND isremoved IS NULL ORDER BY CreateTime DESC");
        let articles = new Array<HnArticle>();
        results.rows.forEach(function(row){
            let article:HnArticle  = {id:row["id"], link:row["href"], title:row["title"]};
            articles.push(article);
        });
        return articles;
    }

    async update(query:string, args:Array<string>): Promise<boolean>{
        const pool = this.getPool();
        pool.query(query,args,function(err,result){
            if(err){
                console.log(err);
                return false;
            }
        });
        return true;
    }

    async getArticle(id:string):Promise<HnArticleAnnotationInfo>{
        const pool = this.getPool();
        var query = "SELECT tags,notes,description FROM hackernewsarticles WHERE id=$1";
        var args = [id];
        var annotationInfo = null;
        let result = await pool.query(query,args);
        if(result.rows.length>0){
            var row = result.rows[0];
            annotationInfo = {'tags':row.tags,'notes':row.notes,'description':row.description}; 
        }
        return annotationInfo;
    }

    async getAllTags(): Promise<HnTag[]> {
        const pool = this.getPool();
        var query = "SELECT id,tag,description FROM hacker_news_tags";
        let result = await pool.query(query);
        let tags = new Array<HnTag>();
        result.rows.forEach(function(row){
            let tag:HnTag  = {id:row["id"], tag:row["tag"], description:row["description"]};
            tags.push(tag);
        });
        return tags;
    }

    async getTagDetails(tagId:string): Promise<HnTagDetails> {
        const pool = this.getPool();
        let getTagQuery = "SELECT id,tag,description FROM hacker_news_tags WHERE id=$1";
        let result = await pool.query(getTagQuery,[tagId]);
        let tagDetails:HnTagDetails = {articles:[],tag:null}
        if(result.rowCount>0){
            let tagInstance:HnTag = {id:result.rows[0]["id"], tag:result.rows[0]["tag"], description:result.rows[0]["description"]};
            let getArticlesQuery = "SELECT * FROM hackernewsarticles WHERE Tags LIKE $1 ORDER BY CreateTime DESC";
            let articleResult = await pool.query(getArticlesQuery, [`%${tagInstance.tag}%`]);
            tagDetails = {tag:tagInstance,articles:articleResult.rows};
        }
        return tagDetails; 
    }

    private getPool():Pool {
        return new Pool( {
            user: this.user,
            password: this.password,
            host: this.host,
            database: this.database,
        });
    }
}