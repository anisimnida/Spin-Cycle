import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, HttpStatus, HttpException, Res } from '@nestjs/common';
import { LaundryService } from './laundry.service';
import { CreateLaundryDto } from './dto/create-laundry.dto';
import { UpdateLaundryDto } from './dto/update-laundry.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerCsvConfig } from 'src/config/multer.config';
import { Public } from 'src/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Laundry')
@Controller({
  path: 'laundry',
  version: '1',
})
export class LaundryController {
  constructor(private readonly laundryService: LaundryService) {}

  @Public()
  @Post('/laundry/import-csv')
  @UseInterceptors(FileInterceptor('file', multerCsvConfig))
  async importCsv(@UploadedFile() file: Express.Multer.File): Promise<{ message: string, uploadUrl: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Upload CSV file to Google Cloud Storage
      const uploadUrl = await this.laundryService.uploadCsvToBucket(file.originalname, file.buffer);

      await this.laundryService.importLaundriesFromCsv(uploadUrl);
      return {
        message: 'CSV uploaded successfully',
        uploadUrl,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to import CSV and upload to DB/GCS: ${error.message}`);
    }
  }

  @Public()
  @Post('/laundry/addfav/:userId/:laundryId')
  async addFavorite(
    @Param('userId') userId: string,
    @Param('laundryId') laundryId: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const message = await this.laundryService.addFavorite(userId, laundryId);
         return res.status(HttpStatus.CREATED).json({
         status_code: HttpStatus.CREATED,
         data: message,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
    
  }

  @Public()
  @Get('/laundry/seefav/:userId')
  async getFavoritesByUser(@Param('userId') userId: string,  @Res() res: Response,): Promise<any> {
    try {
      const favorites = await this.laundryService.getFavoritesByUser(userId);
        return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message:'Successfully',
        data: favorites,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Public()
  @Delete('/laundry/removefav/:userId/:laundryId')
  async removeFavorite(
    @Param('userId') userId: string,
    @Param('laundryId') laundryId: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const message = await this.laundryService.removeFavorite(userId, laundryId);
        return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        data: message,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): Response {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Server Error, cannot update data';

    if (error instanceof HttpException) {
      statusCode = error.getStatus();
      message = error.getResponse()['message'] || message;
    } else if (error instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = error.message || message;
    }

    console.error(error);

    return res.status(statusCode).json({
      status_code: statusCode,
      message: message,
    });
  } 
}
