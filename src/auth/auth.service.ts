import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password){
        const user = await this.prisma.user.findUnique({ where: {email}});

        if(!user) throw new UnauthorizedException('Invalid credentials');

        const verifyPassword = await bcrypt.compare(password, user.password);
        if(!verifyPassword) throw new UnauthorizedException('Invalid credentials');
        console.log('user')
        return user;    
    }

    async login(user: {id: string; username: string, email: string}) {
        const payload = { sub: user.id, username: user.username, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
        }
    }


    async register(data: {email:string; password: string; username: string}) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                username: data.username,
            }

        });

        return this.login(user);
    }
    
}
