import { Get, Controller, Put, Delete, Param, Body, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { BlacklistDto } from '../model/blacklist.dto';
import { BlackListService } from '../service/blacklist.service';


@Controller('blacklist')
export class BlackListController {
    constructor(private BlackListService: BlackListService) {}   

    @Get()
    findAll():Observable<BlacklistDto[]>{
        return this.BlackListService.findAllPosts();
    }

    @Post()
    create(@Body() post: BlacklistDto): Observable<BlacklistDto> {
        return this.BlackListService.createPost(post)
    }

    @Put(':id')
    update(
        @Param('id') id : number,
        @Body() BlacklistDto: BlacklistDto
    ): Observable<UpdateResult>{
        return this.BlackListService.updatePost(id,BlacklistDto)
    }

    @Delete(':id')
    delete(@Param('id') id:number):Observable<DeleteResult>{
        return this.BlackListService.deletePost(id);
    }
}

