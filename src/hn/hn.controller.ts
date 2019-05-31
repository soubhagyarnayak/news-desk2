import { Controller, Get, Req, Res } from '@nestjs/common';
import { HnService } from './hn.service';
import { HnArticle } from './hnArticle.interface';

@Controller('hn')
export class HnController {
    constructor(private readonly hnService: HnService) {}

    @Get()
    async getHn(@Req() req, @Res() res,err) {
        let allArticles : HnArticle[] = await this.hnService.getAll();
        console.log(allArticles[0]);
        return res.render('hn',{articles:allArticles});
    }
}
