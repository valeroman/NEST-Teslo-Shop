import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/interfaces';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server // Inf de todos los clientes conectados

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection( client: Socket ) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {

      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient( client, payload.id );
      
    } catch (error) {
      client.disconnect();
      return;
    }

    // console.log({ payload })
    // console.log('Cliente conectado:', client.id);
    
    this.wss.emit('client-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect( client: Socket ) {
    // console.log('Cliente desconectado:', client.id);
    this.messagesWsService.removeClient( client.id );

    this.wss.emit('client-updated', this.messagesWsService.getConnectedClients());

  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto ) {

    // Emite únicamente al cliente
    // client.emit('message-from-server', {
    //   fullName: 'Soy YO!!',
    //   message: payload.message || 'no-message!!',
    // })

    // Emitir a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy YO!!',
    //   message: payload.message || 'no-message!!',
    // })

    // Emite a todos incluyendo al cliente que escribe el mensaje
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!',
    })
  }

}
