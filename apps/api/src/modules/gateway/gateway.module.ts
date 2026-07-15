import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { AuthModule } from '../auth/auth.module'; // for potentially injecting auth guards later

@Module({
  imports: [AuthModule],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
