import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AddressController],
  providers: [AddressService, PrismaService,AuthService, JwtService],
})
export class AddressModule {}
