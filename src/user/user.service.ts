import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import logger from '../logger.js';
@Injectable()
export class UserService {
    constructor(private prisma: PrismaService,  @Inject(CACHE_MANAGER) private cacheManager: Cache){}

    async findOne(id: string){
        const book = await this.prisma.user.findUniqueOrThrow({
            where: {
                id
            }
        });

        return book;

    }

    async findAll(page=1, limit = 10, sortBy = 'username'){

        const cacheKey = `users:${page}:${limit}:${sortBy}:${'asc'}`;
        const cached = await this.cacheManager.get(cacheKey);
      
        if (cached) {
          return cached;
        }

        const users = await this.prisma.user.findMany({
            skip: (page - 1)*limit,
            take: limit,
            orderBy: {[sortBy]: 'asc'},
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            }
        });
        await this.cacheManager.set(cacheKey, users, 60000);
        return users;
    }


    async update(userId: string, id: string, dto: CreateUserDto){
        const user = await this.prisma.user.findUniqueOrThrow({where: {id}});

    if( userId !== user.id) throw new ForbiddenException('You can only update your own account.')


        const updateduser = await this.prisma.user.update({
            where: { id },
            data: dto,
        });

        await this.invalidateBooksCache();
        logger.info(`User ${user.username} updated`);
        return updateduser;

    }

    async delete(userId: string, id: string){
        const user = await this.prisma.user.findUniqueOrThrow({where: {id}});

        if( userId !== user.id) throw new ForbiddenException('You can only delete your own account.')
        
        const deletedBook = this.prisma.user.delete({
            where:{
                id: id
            }
        });

        await this.invalidateBooksCache();
        logger.info(`User ${user.username} deleted`);
        return deletedBook;

    }

    private async invalidateBooksCache() {
        await this.cacheManager.del('users:1:10:createdAt:desc');
        await this.cacheManager.del('users:1:10:createdAt:asc');
        
        console.log('Books cache invalidated');
    }

}
