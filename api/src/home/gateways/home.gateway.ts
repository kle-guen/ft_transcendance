import { SubscribeMessage, WebSocketGateway , WebSocketServer} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import { UserEntity } from 'src/user/models/user.entity';
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ cors: true, origin: `http://localhost:4200` } )
export class HomeGateway {


    constructor(private readonly UserService: UserService, private jwtService: JwtService){}
    
    @WebSocketServer()
    server: Server;
    
    async handleConnexion(client : any){
      const token: string[] = client.handshake.headers['authorization'].split(' ');
      try {
          const decodedToken = await this.jwtService.verifyAsync(token[1], { secret: process.env.JWT_SECRET });
          if (decodedToken) {
              client.handshake['userId'] = client.handshake['userId'];
          } else {
              client.emit('Error', "ServerEmit: wrong jwt");
              client.disconnect();
          }
      } catch (error) {
          client.emit('Error', "ServerEmit: wrong jwt catch");
      }
    }

    handleDisconnect(client: any) {
      const userId = client.handshake['userId'];
    }
}
