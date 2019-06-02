import { Controller, Get, Req, Res, Post } from '@nestjs/common';
import { HnService } from './hn.service';
import { HnArticle } from './hnArticle.interface';

@Controller('hn')
export class HnController {
    constructor(private readonly hnService: HnService) {}

    @Get()
    async getHn(@Req() req, @Res() res,err) {
        let allArticles : HnArticle[] = await this.hnService.getAll();
        return res.render('hn',{articles:allArticles});
    }

    @Post("/")
    async postHn(@Req() req, @Res() res, err){
        let query = null;
        let args = [];
        if(req.body.operation == 'markRead'){
            query = "UPDATE hackernewsarticles SET isread = true WHERE id = $1";
            args = [req.body.id];
        }
        else if(req.body.operation=='remove'){
            query = "UPDATE hackernewsarticles SET isremoved = true WHERE id =$1";
            args = [req.body.id];
        } else if(req.body.operation=='annotate'){
            query = "UPDATE hackernewsarticles SET tags = $1, notes=$2 WHERE id =$3";
            args = [req.body.tags,req.body.notes,req.body.id];
        }
        let result:boolean = await this.hnService.update(query,args);
        if(result){
            res.status(200).send("success");
        }
        else{
            res.status(400).send("failure");
        }
    }
}
