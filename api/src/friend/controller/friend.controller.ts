import { Get, Controller, Put, Delete, Param, Body, Post } from '@nestjs/common';
import { FriendService } from '../service/friend.service';
import { FriendDto } from '../model/friend.dto';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('friend')
export class FriendController {
    constructor(private FriendService: FriendService) {}   

    @Get()
    findAll():Observable<FriendDto[]>{
        return this.FriendService.findAllPosts();
    }

    @Post()
    create(@Body() post: FriendDto): Observable<FriendDto> {
        return this.FriendService.createPost(post)
    }

    @Put(':id')
    update(
        @Param('id') id : number,
        @Body() FriendDto: FriendDto
    ): Observable<UpdateResult>{
        return this.FriendService.updatePost(id,FriendDto)
    }

    @Delete(':id')
    delete(@Param('id') id:number):Observable<DeleteResult>{
        return this.FriendService.deletePost(id);
    }
}
