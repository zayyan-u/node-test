import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || 'secret',
        });
        console.log('JwtStrategy registered');
    }


    async validate(payload: any) {
        console.log('JWT payload received in strategy:', payload);
        return { id: payload.sub, email: payload.email, username: payload.username };
    }
}