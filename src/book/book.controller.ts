import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { BookService } from './book.service';
  import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { ThrottlerGuard } from '@nestjs/throttler';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { RabbitmqService } from 'src/common/rabbitmq/rabbitmq.service';
  
  @ApiTags('Book')
  @Controller('book')
  export class BookController {
    constructor(
      private bookService: BookService,
      private readonly rabbitService: RabbitmqService,
    ) {}
  
    @Post()
    @ApiBearerAuth()
    @UseGuards(ThrottlerGuard)
    @UseGuards(JwtAuthGuard)
    create(@Body() dto: CreateBookDto, @Req() req) {
      console.log('user', req.user.id);
      return this.bookService.create(req.user.id, dto);
    }
  
    @Post('queue')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async createQ(@Body() dto: CreateBookDto, @Req() req) {
      await this.rabbitService.enqueueBookCreate({
        title: dto.title,
        author: dto.author,
        userId: req.user.id,
      });
      return { message: 'Book creation enqueued' };
    }
  
    @Get()
    async findAll(
      @Query('page') page: string,
      @Query('limit') limit: string,
      @Query('sortBy') sortBy: string,
      @Query('order') order: 'asc' | 'desc',
    ) {
      return await this.bookService.findAll(
        Number(page) || 1,
        Number(limit) || 10,
        sortBy || 'createdAt',
        order || 'desc',
      );
    }
  
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: string) {
      return await this.bookService.findOne(id);
    }
  
    @Put(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    update(
      @Param('id', ParseIntPipe) id: string,
      @Body() dto: UpdateBookDto,
      @Req() req,
    ) {
      return this.bookService.update(req.user.id, id, dto);
    }
  
    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    delete(@Param('id', ParseIntPipe) id: string, @Req() req) {
      return this.bookService.delete(req.user.id, id);
    }
  }
  