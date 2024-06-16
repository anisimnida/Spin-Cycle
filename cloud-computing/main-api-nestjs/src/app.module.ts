import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { ConfigModule } from '@nestjs/config';
import { AddressModule } from './address/address.module';
import { LaundryModule } from './laundry/laundry.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, UsersModule, PrismaModule.forRoot(), AddressModule, LaundryModule],
  controllers: [AppController],
  providers: [AppService, PrismaService,
    {
    provide: APP_GUARD,
    useClass: AtGuard,
    },
],
})
export class AppModule {}
