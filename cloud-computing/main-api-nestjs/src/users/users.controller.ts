import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Put, Req, HttpException, UseInterceptors, UploadedFile, ParseUUIDPipe } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImageConfig } from 'src/config/multer.config';

@ApiTags('Users')
@Controller({
  path: 'user',
  version: '1',
})

export class UsersController {
    constructor(
        private readonly usersService: UsersService,) {}
  
  @Public()      
  @Post('/create-user/')
  async creaeUser(
    @Body() CreateUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const createdUser = await this.usersService.createUser(CreateUserDto);
      return res.status(HttpStatus.CREATED).json({
        status_code: HttpStatus.CREATED,
        message: 'User Created Successfully',
        data: createdUser,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }
      
  @Get('/lists-user')
  async getAllUser(@Res() res: Response): Promise<Response> {
    try {
      const user = await this.usersService.getAllUsers();
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Fetch User Successfully',
        data: user,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }
        
  @Get('/detail-user/:userId')
  async getUserById( @Param('userId') id: string, @Res() res: Response): Promise<Response> {
    try {
      const user = await this.usersService.getUserById(id);
      if (!user) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Server Error, cannot get data',
        });
      }
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: user,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Put('/update-user/:userId')
  async udpateUser( @Param('userId') id: string, @Body() updateUserDto: UpdateUserDto, @Res() res: Response): Promise<Response> {
    try {
      const updateUser = await this.usersService.updateUser(
        id,
        updateUserDto,
      );
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'User updated successfully',
        data: updateUser,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Delete('/delete-user/:userId')
  async deleteUser( @Param('userId') id: string, @Res() res: Response ): Promise<Response> {
    try {
      const deleteUser = await this.usersService.deleteUser(id);
      if (deleteUser) {
        return res.status(HttpStatus.OK).json({
          status_code: HttpStatus.OK,
          message: 'User deleted successfully',
        });
      }
    } catch (error) {
      return this.handleError(error, res);
    }
  }

   
  @Post('/upload-images/:userId')
  @UseInterceptors(FileInterceptor('images', multerImageConfig))
  async uploadUserImages(
    @Param('userId', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      const imageUrl = await this.usersService.uploadImage(id, file);
      return {
        message: 'Image uploaded successfully',
        imageUrl,
      };
    } catch (error) {
      throw new HttpException(
        `Upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  // @Public()   
  // @Post('/upload-image/:userId')
  // @UseInterceptors(FileInterceptor('images', multerConfig))
  // async uploadUserImage(
  //   @Param('userId', ParseUUIDPipe) id: string,
  //   @UploadedFile() file: Express.Multer.File
  // ) {
  //   const imagePath = `/uploads/users/${file.filename}`;
  //   await this.usersService.updateUserImage(id, imagePath);
  //   return { message: 'Image uploaded successfully', imagePath };
  // }

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
