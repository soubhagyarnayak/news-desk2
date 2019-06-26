import { Controller, Get, Req, Res, Post } from '@nestjs/common';
import { OpedService } from "./oped.service";
import { OpedCategoryCollection } from "./opedCategory.interface";

@Controller('oped')
export class OpedController {
    constructor(private readonly opedService: OpedService) {}

    @Get()
    async getOped(@Req() req, @Res() res,err) {
        let categories : OpedCategoryCollection = await this.opedService.getAll();
        console.log(categories);
        console.log(categories.pending);
        res.render('oped',{categories:categories.categories,pending:categories.pending});
    }
}
