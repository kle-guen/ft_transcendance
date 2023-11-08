import { Get, Body, Controller, Post, Put, Param, Delete } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { gamePost } from '../models/game.interface';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('game')
export class GameController {
    constructor(private GameService: GameService) {

    }   

    @Get()
    findAll():Observable<gamePost[]>{
        return this.GameService.findAllPosts();
    }
    
    @Put(':id')
    update(
        @Param('id') id : number,
        @Body() gamePost: gamePost
    ): Observable<UpdateResult>{
        return this.GameService.updatePost(id,gamePost)
    }

    @Delete(':id')
    delete(@Param('id') id:number):Observable<DeleteResult>{
        return this.GameService.deletePost(id);
    }
}
