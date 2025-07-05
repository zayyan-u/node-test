import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}


    @Get()
    async findAll(
      @Query('page') page: string,
      @Query('limit') limit: string,
      @Query('sortBy') sortBy: string,
    ) {
      return await this.userService.findAll(
        Number(page) || 1,
        Number(limit) || 10,
        sortBy || 'username',
      );
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return await this.userService.findOne(id);
    }
  
    @Put(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    update(
      @Param('id') id: string,
      @Body() dto: CreateUserDto,
      @Req() req,
    ) {
      return this.userService.update(req.user.id, id, dto);
    }
  
    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    delete(@Param('id') id: string, @Req() req) {
      return this.userService.delete(req.user.id, id);
    }
}
