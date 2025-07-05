// rabbitmq.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqService } from './rabbitmq.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'book_exchange',
            type: 'topic',
          },
        ],
        uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
      }),
    }),
  ],
  providers: [RabbitmqService, PrismaService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}