import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BookService {
    constructor(private prisma: PrismaService, @Inject(CACHE_MANAGER) private cacheManager: Cache){}

    async create(userId: string, data: CreateBookDto){
        const user = await this.prisma.user.findUnique({
            where:{id: userId}
        })

        if(!user){
            throw Error('User does not exist')
        }

        return this.prisma.book.create({
            data:{
                title: data.title,
                author: data.author,
                userId
            },
        })
    }

    async findOne(id: string){
        const book = await this.prisma.book.findUniqueOrThrow({
            where: {
                id
            }
        });

        return book;

    }


    async findAll(page=1, limit = 10, sortBy = 'createdAt', order:'asc' | 'desc' = 'desc'){

        const cacheKey = `books:${page}:${limit}:${sortBy}:${order}`;
        const cached = await this.cacheManager.get(cacheKey);
      
        if (cached) {
          return cached;
        }

        const books = await this.prisma.book.findMany({
            skip: (page - 1)*limit,
            take: limit,
            orderBy: {[sortBy]: order},
            include: {
                user: {
                    select: { id: true, username: true},
                }
            }
        });
        await this.cacheManager.set(cacheKey, books, 60000);
        return books;
    }


    async update(userId: string, id: string, dto: UpdateBookDto){
        const book = await this.prisma.book.findUniqueOrThrow({where: {id}});

        if(book.userId !== userId ) throw new ForbiddenException('Not your book');

        const updatedbook = await this.prisma.book.update({
            where: { id },
            data: dto,
        });

        await this.invalidateBooksCache();
        return updatedbook;

    }

    async delete(userId: string, id: string){
        const book = await this.prisma.book.findUniqueOrThrow({where: {id}});

        if(book.userId !== userId ) throw new ForbiddenException('Not your book');

        const deletedBook = this.prisma.book.delete({
            where:{
                id: id
            }
        });

        await this.invalidateBooksCache();
        return deletedBook;

    }

    private async invalidateBooksCache() {
        await this.cacheManager.del('books:1:10:createdAt:desc');
        await this.cacheManager.del('books:1:10:createdAt:asc');
        
        console.log('Books cache invalidated');
    }


}
