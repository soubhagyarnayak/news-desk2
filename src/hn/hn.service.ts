import { Injectable } from '@nestjs/common';
import { HnArticle, HnArticlePerDayMap } from './hnArticle.interface';
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
    private pool: Pool;
    
    constructor(config: ConfigService) {
        this.user = config.get('DB_USER');
        this.password = config.get('DB_PASSWORD');
        this.host = config.get('DB_HOST');
        this.database = config.get('DB_DATABASE');
        this.pool = this.getPool();
    }

    async getAll(): Promise<HnArticlePerDayMap> { 
        let query = "SELECT id,link as href,title,createtime FROM hackernewsarticles WHERE isread IS NULL AND isremoved IS NULL ORDER BY CreateTime DESC";
        return this.getArticles(query);
    }

    async getAllArchived():Promise<HnArticlePerDayMap>{
        let query = "SELECT id,link as href,title,createtime FROM hackernewsarticles WHERE isremoved=true ORDER BY CreateTime DESC";
        return this.getArticles(query);
    }

    async getAllRead(): Promise<HnArticlePerDayMap> {
        let query = "SELECT id,link as href,title,createtime FROM hackernewsarticles WHERE isread IS NOT NULL ORDER BY CreateTime DESC"
        return this.getArticles(query)
    }

    async getArticles(query:string):Promise<HnArticlePerDayMap>{
        let results = await this.pool.query(query);
        let articlesForDates = new Map<string,Array<HnArticle>>();
        let backlogCount = 0;
        results.rows.forEach(function(row){
            let article:HnArticle  = {id:row["id"], link:row["href"], title:row["title"], createTime:row["createtime"]};
            let key = article.createTime.toLocaleDateString();
            if(!articlesForDates.has(key)){
                articlesForDates.set(key,new Array<HnArticle>());
            }
            articlesForDates.get(key).push(article);
            backlogCount++;
        });
        let result:HnArticlePerDayMap = {articles:articlesForDates,count:backlogCount};
        return result;
    }

    async update(query:string, args:Array<string>): Promise<boolean>{
        this.pool.query(query,args,function(err,result){
            if(err){
                console.log(err);
                return false;
            }
        });
        return true;
    }

    async getArticle(id:string):Promise<HnArticleAnnotationInfo>{
        var query = "SELECT tags,notes,description FROM hackernewsarticles WHERE id=$1";
        var args = [id];
        var annotationInfo = null;
        let result = await this.pool.query(query,args);
        if(result.rows.length>0){
            var row = result.rows[0];
            annotationInfo = {'tags':row.tags,'notes':row.notes,'description':row.description}; 
        }
        return annotationInfo;
    }

    async getAllTags(): Promise<HnTag[]> {
        var query = "SELECT id,tag,description FROM hacker_news_tags ORDER BY tag";
        let result = await this.pool.query(query);
        let tags = new Array<HnTag>();
        result.rows.forEach(function(row){
            let tag:HnTag  = {id:row["id"], tag:row["tag"], description:row["description"]};
            tags.push(tag);
        });
        return tags;
    }

    async getTagDetails(tagId:string): Promise<HnTagDetails> {
        let getTagQuery = "SELECT id,tag,description FROM hacker_news_tags WHERE id=$1";
        let result = await this.pool.query(getTagQuery,[tagId]);
        let tagDetails:HnTagDetails = {articles:[],tag:null}
        if(result.rowCount>0){
            let tagInstance:HnTag = {id:result.rows[0]["id"], tag:result.rows[0]["tag"], description:result.rows[0]["description"]};
            let getArticlesQuery = "SELECT * FROM hackernewsarticles WHERE Tags LIKE $1 ORDER BY CreateTime DESC";
            let articleResult = await this.pool.query(getArticlesQuery, [`%${tagInstance.tag}%`]);
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