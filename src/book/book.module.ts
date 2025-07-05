import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [BookController],
  providers: [BookService]
})
export class BookModule {}
