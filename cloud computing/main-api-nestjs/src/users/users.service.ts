import {Injectable, NotFoundException,ConflictException, HttpException, HttpStatus} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto, UpdateUserDto } from './dto'
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Storage } from '@google-cloud/storage';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

@Injectable()
export class UsersService {
  private storage: Storage;
  private bucketName: string;
  constructor(private readonly prisma: PrismaService) {
    this.storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_PROJECT_ID,
    });
    this.bucketName = process.env.GOOGLE_BUCKET_NAME;
  }

  async createUser(createUsersDto: CreateUserDto): Promise<any> {
    try {
      const existingUser = await this.prisma.users.findUnique({
        where: {
          email: createUsersDto.email,
        },
      });
  
      if (existingUser) {
        throw new ConflictException(
          'Email is already in use',
        );
      }
      const hashedPassword = await bcrypt.hash(createUsersDto.password, 10);
      const createdUser = await this.prisma.users.create({
        data: {
          ...createUsersDto,
          password: hashedPassword,
        },
      });
      return createdUser;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      return await this.prisma.users.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: string): Promise<any> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: id },
        select: {
          id: true,
          name: true,
          email: true,
          no_phone: true,
          imageUrl: true,
          created_at:true,
          updated_at:true,
        },
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    try {
      const users = await this.prisma.users.findUnique({
        where: { id },
      });
  
      if (!users) {
        throw new NotFoundException('user not found');
      }
      
      if (updateUserDto.email && updateUserDto.email !== users.email) {
        const existingUser = await this.prisma.users.findUnique({
          where: { email: updateUserDto.email },
        });
  
        if (existingUser) {
          throw new ConflictException('Email is already in use');
        }
      }

      return await this.prisma.users.update({
        where: { id: id },
        data: updateUserDto,
        select:{
          id:true,
          name:true,
          email:true,
          no_phone:true,
          updated_at:true
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: id },
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const addresses = await this.prisma.address.findMany({
        where: { userId: id },
      });
  
      await Promise.all(
        addresses.map((address) =>
          this.prisma.address.delete({
            where: { id: address.id },
          })
        )
      );
  
      // Delete the user
      await this.prisma.users.delete({
        where: { id },
      });
  
      return true;
    } catch (error) {
      throw error;
    }
  }

  async uploadImage(id: string, file: Express.Multer.File): Promise<string> {
    try {
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const bucket = this.storage.bucket(this.bucketName);
      const filename = `profile-photos/${uuidv4()}${extname(file.originalname)}`;
      const blob = bucket.file(filename);

      await blob.save(file.buffer, {
        resumable: false,
        gzip: true,
        contentType: file.mimetype,
        public: true,
      });

      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      await this.prisma.users.update({
        where: { id },
        data: {
          imageUrl: imageUrl,
        },
      });

      return imageUrl;
    } catch (error) {
      throw new HttpException(
        `Image upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserImage(userId: string, imagePath: string) {
    return this.prisma.users.update({
      where: { id: userId },
      data: { imageUrl: imagePath },
    });
  }
}