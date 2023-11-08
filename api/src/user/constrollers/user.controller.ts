import { UseGuards, Request, Get, Body, Controller, Post, Put, Param, Delete, HttpException, HttpStatus, Req, UnauthorizedException, HttpCode } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserI } from '../models/user.interface';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from 'src/access_token/jwt-auth.guard';
import { UserEntity } from '../models/user.entity';
@Controller('user')
export class UserController {
    jwtService: any;
    constructor(private userService: UserService) {
    }

    @Post()
    create(@Body() post: UserI): Observable<UserI> {
        return this.userService.createPost(post)
    }

    @Get()
    async findAll(): Promise<UserEntity[]> {
        return await this.userService.findAllPosts();
    }

    @UseGuards(JwtAuthGuard)
    @Get('getTwofa')
    async getTwofa(@Request() req): Promise<any> {
        const authorizationHeader = req.headers['authorization'];
        if (!authorizationHeader) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        const tokenParts = authorizationHeader.split(' ');
        const token = tokenParts[1];
        if (!token) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as { userId: number }; // Assurez-vous que userId est correctement typé
        const userId = decodedToken.userId;
        try {
            return await this.userService.getTwofa(userId)
        } catch (error) {
            // Log the error for debugging purposes
            console.error(error);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    update(
        @Param('id') id: number,
        @Body() UserI: UserI
    ): Observable<UpdateResult> {
        return this.userService.updatePost(id, UserI)
    }

    @UseGuards(JwtAuthGuard)
    @Post('setTwofa')
    async setTwofa(@Body() code: { code: boolean }, @Request() req): Promise<any> {
        try {
            return await this.userService.updateTwofa(req, code.code);
        } catch (error) {
            // Log the error for debugging purposes
            console.error(error);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    delete(@Param('id') id: number): Observable<DeleteResult> {
        return this.userService.deletePost(id);
    }
}
