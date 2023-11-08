import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { AccessTokenService } from "src/access_token/service/access_token.service";
import { UserI } from "src/chat/model/chat.interface";
import { UserEntity } from "src/user/models/user.entity";
import { UserService } from "src/user/services/user.service";
export interface RequestMiddlewareModel {
    user: UserI;
    headers: any;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private authService: AccessTokenService,
        private userService: UserService,
    ) { }

    async use(req: RequestMiddlewareModel, res: Response, next: NextFunction) {
        try {
            const token: string[] = req.headers['authorization'].split(' ');
            const decodedToken = await this.authService.verifyJwt(token[1]);
            const user: UserEntity = await this.userService.findOne(decodedToken.userId);
            if (user) {
                req.user = user; 
                next();
            } else {
                throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
            }
        }
        catch {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
        }
    }
}

