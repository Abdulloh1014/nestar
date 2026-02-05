import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ tranports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
  private logger: Logger = new Logger('SocketEventsGateway');
  private summanryClient: number = 0;
  
  public afterInit(server: Server) {
      this.logger.log(`WebSocket Server Initialized total: ${this.summanryClient}`)
  }

  handleConnection(client: WebSocket, ...args: any[]) {
    this.summanryClient++;
    this.logger.log(`== Client Connected total: ${this.summanryClient} ==`);
  }

  handleDisconnect(client: WebSocket) {
    this.summanryClient--;
    this.logger.log(`== Client Disconnected left total: ${this.summanryClient} ==`);
  }

  @SubscribeMessage('message')
  public handleMessage(client: WebSocket, payload: any): string {
    return 'Hello world!';
  }
}
