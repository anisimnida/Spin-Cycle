/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { AuthDto, UpdatePasswordDto } from './dto';
import { JwtPayload, Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { IncomingHttpHeaders } from 'http';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async login(authDto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.users.findUnique({
      where: { email: authDto.email },
    });

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const passwordMatches = await bcrypt.compare(authDto.password, user.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(id: string): Promise<boolean> {
    await this.prisma.users.updateMany({
      where: {
        id: id,
        hashRt: {
          not: null,
        },
      },
      data: {
        hashRt: null,
      },
    });
    return true;
  }

  async getTokens(id: string): Promise<Tokens> {

    const user = await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.AT_SECRET, 
        expiresIn: process.env.AT_EXPIRES_IN,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.RT_SECRET, 
        expiresIn: process.env.RT_EXPIRES_IN,
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async refreshTokens(id: string, rt: string): Promise<Tokens> {
    const user = await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
    if (!user || !user.hashRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, user.hashRt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(id: string, rt: string): Promise<void> {
    try {
      const hash = await bcrypt.hash(rt, 10);
      await this.prisma.users.update({
        where: {
          id: id,
        },
        data: {
          hashRt: hash,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update RT hash: ${error.message}`);
    }
  }

  async changePassword(
    req: Request,
    updatePasswordDto:UpdatePasswordDto
  ): Promise<any> {
    try {
      // Extract token and user ID
      const token = this.extractTokenFromHeaders(req);
      const userId = await this.extractUserIdFromToken(token);

      // Verify the old password
      await this.verifyPassword(updatePasswordDto.oldPassword, userId);

      // Hash the new password and update
      const hashedNewPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
      const result = await this.prisma.users.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof NotFoundException || error instanceof UnauthorizedException || error instanceof BadRequestException) {
      throw error;
    } else {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private extractTokenFromHeaders(req: Request): string {
    const headers = req.headers as unknown as IncomingHttpHeaders;
    if (!headers || !headers.authorization) {
      throw new HttpException(
        'Authorization header is missing',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = headers.authorization.split(' ')[1];
    if (!token) {
      throw new HttpException('Token is missing', HttpStatus.UNAUTHORIZED);
    }
    return token;
  }

  private async verifyPassword(oldPassword: string, userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }
  }

  private async extractUserIdFromToken(token: string): Promise<string> {
    const decoded: any = this.jwtService.decode(token);
    if (!decoded || !decoded.id) {
      throw new BadRequestException('Invalid JWT token or missing user ID');
    }
    return decoded.id;
  }

  
}
