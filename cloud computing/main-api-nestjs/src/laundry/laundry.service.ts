import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLaundryDto } from './dto/create-laundry.dto';
import { UpdateLaundryDto } from './dto/update-laundry.dto';
import { PrismaService } from 'nestjs-prisma';
import { Laundry, Prisma } from '@prisma/client';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface LaundryData {
  laundry_id: number;
  name: string;
  address: string;
  operating_hours: string; 
  website?: string; 
  contact: string;
  maps?: string; 
  service_type: string;
  imageUrl?: string; 
}

@Injectable()
export class LaundryService {
  private storage: Storage;
  private bucketName: string;

  constructor(private readonly prisma: PrismaService) {
    this.storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_PROJECT_ID,
    });
    this.bucketName = process.env.GOOGLE_BUCKET_NAME;
  }

  
  async importLaundriesFromCsv(fileUrl: string): Promise<void> {
    const laundries: LaundryData[] = [];

    try {
      // Fetch CSV file from the provided URL using Axios
      const response = await axios.get(fileUrl, { responseType: 'stream' });
      await new Promise<void>((resolve, reject) => {
        response.data
          .pipe(parse({ columns: headers => headers.map(h => h.toLowerCase()) })) // Specify headers: true to use first row as headers
          .on('data', async (row: any) => { 
            // Map CSV columns to your schema
            const laundry: LaundryData = {
              laundry_id: parseInt(row['id laundry'].trim()),
              name: row['name'] ? row['name'].trim() : null,
              address: row['fulladdress'] ? row['fulladdress'].trim() : null,
              operating_hours: row['opening hours'] ? row['opening hours'].trim() : null,
              website: row['website'] ? row['website'].trim() : null,
              contact: row['phone'] ? row['phone'].trim() : null,
              maps: row['google maps url'] ? row['google maps url'].trim() : null,
              service_type: row['layanan'] ? row['layanan'].trim() : null,
              imageUrl: row['featured image'] ? row['featured image'].trim() : null,
            };

            laundries.push(laundry);
          })
          .on('end', async () => {
            // Process the array of laundries and save to database
            for (const laundry of laundries) {
              try {
                const existingLaundry = await this.prisma.laundry.findUnique({
                  where: { laundry_id: laundry.laundry_id },
                });

                if (existingLaundry) {
                  throw new ConflictException(`Laundry with ID ${laundry.laundry_id} already exists`);
                }

                await this.prisma.laundry.create({
                  data: laundry,
                });
              } catch (error) {
                reject(new BadRequestException(`Failed to create laundry: ${error.message}`));
              }
            }

            resolve();
          })
          .on('error', (error) => {
            reject(new BadRequestException(`Error parsing CSV: ${error.message}`));
          });
      });
    } catch (error) {
      throw new BadRequestException(`Failed to import laundries: ${error.message}`);
    }
  }
  
  async uploadCsvToBucket(filename: string, fileBuffer: Buffer): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const destinationFilename = `csv/${uuidv4()}${filename}`;

    try {
      const file = bucket.file(destinationFilename);

      await new Promise((resolve, reject) => {
        const stream = file.createWriteStream({
          resumable: false,
          gzip: true,
          metadata: {
            contentType: 'text/csv',
          },
        });

        stream.on('error', (error) => {
          reject(new BadRequestException(`Failed to upload file to Google Cloud Storage: ${error.message}`));
        });

        stream.on('finish', () => {
          resolve(`https://storage.googleapis.com/${this.bucketName}/${destinationFilename}`);
        });

        stream.end(fileBuffer); // Upload the file buffer directly
      });

      return `https://storage.googleapis.com/${this.bucketName}/${destinationFilename}`;
    } catch (error) {
      throw new BadRequestException(`Failed to upload file to Google Cloud Storage: ${error.message}`);
    }
  }

  async addFavorite(userId: string, laundryId: string): Promise<string> {
    try {
      const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const laundry = await this.prisma.laundry.findUnique({ where: { id: laundryId } });
    if (!laundry) {
      throw new NotFoundException(`Laundry place with ID ${laundryId} not found`);
    }
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_laundryId: {
          userId: userId,
          laundryId: laundryId,
        },
      },
    });

    if (existingFavorite) {
      throw new BadRequestException('Laundry place is already in favorites');
    }
    await this.prisma.favorite.create({
      data: {
        user: {
          connect: { id: userId },
        },
        laundry: {
          connect: { id: laundryId },
        },
      },
    });

    return 'Laundry place added to favorites successfully';
    } catch (error) {
      throw error
    }
    
  }

  async removeFavorite(userId: string, laundryId: string): Promise<string> {
   try {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_laundryId: {
          userId,
          laundryId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException(`Favorite not found for user ID ${userId} and laundry ID ${laundryId}`);
    }

    await this.prisma.favorite.delete({
      where: {
        userId_laundryId: {
          userId,
          laundryId,
        },
      },
    });

    return 'Laundry place removed from favorites successfully';
    }  catch (error) {
       throw error
    }
  }

  async getFavoritesByUser(userId: string): Promise<LaundryData[]> {
    try {
      const user = await this.prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { laundry: true },
    });

    return favorites.map(favorite => favorite.laundry);
    } catch (error) {
      throw error
    }
  }
}
