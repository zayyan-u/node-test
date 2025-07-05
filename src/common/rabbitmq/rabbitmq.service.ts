import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RabbitmqService {
  constructor(
    private readonly amqp: AmqpConnection,
    private readonly prisma: PrismaService,
  ) {}

  private readonly logger = new Logger(RabbitmqService.name);

  async enqueueBookCreate(payload: {
    title: string;
    author: string;
    userId: number;
  }) {
    await this.amqp.publish('book_exchange', 'book.create', payload);
    this.logger.log(`Book creation job enqueued: ${payload.title}`);
  }

  @RabbitSubscribe({
    exchange: 'book_exchange',
    routingKey: 'book.create',
    queue: 'book_create_queue',
  })
  async handleBookCreate(payload: {
    title: string;
    author: string;
    userId: string;
  }) {
    this.logger.log(`Processing book: ${payload.title}`);
    try {
      await this.prisma.book.create({
        data: {
          title: payload.title,
          author: payload.author,
          userId: payload.userId,
        },
      });
      this.logger.log(` Book saved: ${payload.title}`);
    } catch (err) {
      this.logger.error('Failed to save book:', err);
    }
  }
}
