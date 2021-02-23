import { Controller, Get, Req, Res, Post, UseGuards } from '@nestjs/common';
import { OpedService } from "./oped.service";
import { OpedCategoryCollection } from "./opedCategory.interface";
import { OpedAnnotation } from './opedAnnotation.interface';
import JwtAuthGuard from 'src/auth/jwt.auth.guard';

@Controller('oped')
@UseGuards(JwtAuthGuard)
export class OpedController {
    constructor(private readonly opedService: OpedService) {}

    @Get()
    async getOped(@Req() req, @Res() res,err) {
        let categories : OpedCategoryCollection = await this.opedService.getAll();
        console.log(categories);
        console.log(categories.pending);
        res.render('oped',{categories:categories.categories,pending:categories.pending});
    }

    @Post("/")
    async postHn(@Req() req, @Res() res, err){
        let result:boolean = false;
        if(req.body.operation == 'markRead'){
            result = await this.opedService.markRead(req.body.id);
        }
        else if(req.body.operation=='remove'){
            result = await this.opedService.remove(req.body.id);
        } else if(req.body.operation=='annotate'){
            result = await this.opedService.annotate(req.body.id,req.body.notes,req.body.tags);
        }
        if(result){
            res.status(200).send("success");
        }
        else{
            res.status(400).send("failure");
        }
    }

    @Get("/article")
    async getArticle(@Req() req, @Res() res,err){
        let annotation:OpedAnnotation = await this.opedService.getArticle(req.query.id);
        if(annotation == null){
            res.status(500).send("Error");
        }
        else{
            res.status(200).send(annotation);
        }
    }
}
