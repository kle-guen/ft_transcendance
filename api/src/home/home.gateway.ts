import { JwtService } from '@nestjs/jwt';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { BlackListService } from 'src/blacklist/service/blacklist.service';
import { ChatService } from 'src/chat/service/chat.service';
import { UserService } from 'src/user/services/user.service';

@WebSocketGateway({ cors: { origin: 'http://localhost:4200' } })
export class HomeGateway {

  constructor(private userService: UserService, private readonly chatService: ChatService, private jwtService: JwtService, private blackListService: BlackListService) { }

  async handleConnection(client: any) {

    const token: string[] = client.handshake.headers['authorization'].split(' ');
    try {
      const decodedToken = await this.jwtService.verifyAsync(token[1], { secret: process.env.JWT_SECRET });
      if (decodedToken) {
        client.handshake['userId'] = decodedToken.userId;
        this.userService.setStatus(decodedToken.userId, 1);
      } else {
        client.emit('Error', "ServerEmit: wrong jwt");
        client.disconnect();
      }
    } catch (error) {
      client.emit('Error', "ServerEmit: wrong jwt catch");
    }

  }

  handleDisconnect(client: any) {
    this.userService.setStatus(client.handshake['userId'], 0);
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

}
