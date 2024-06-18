import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpStatus, HttpException, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Address')
@Controller({
  path: 'address',
  version: '1',
})

export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('/create-address/:userId')
  async createAddress(
    @Param('userId') userId: string,
    @Body() createAddressDto: CreateAddressDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const newAddress = await this.addressService.createAddress(userId, createAddressDto);
      return res.status(HttpStatus.CREATED).json({
        status_code: HttpStatus.CREATED,
        message: 'Address Created Successfully',
        data: newAddress,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Put('/update-address/:addressId')
  async updateAddress(
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const updatedAddress = await this.addressService.updateAddress(addressId, updateAddressDto);
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Address Updated Successfully',
        data: updatedAddress,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Put('/setMain-address/:addressId/:userId')
  async setMainAddress(
    @Param('addressId') addressId: string,
    @Param('userId') userId: string,
    @Res() res: Response
  ) {
    try {
      const updatedAddress = await this.addressService.switchMainAddress(userId, addressId);
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Address set as main successfully',
        data: updatedAddress,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Get('/detail-address/:addressId')
  async getAddressById(
    @Param('addressId') addressId: string,
    @Res() res: Response
  ) {
    try {
      const address = await this.addressService.getAddressById(addressId);
      if (!address) {
        throw new NotFoundException('Address not found');
      }
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Address retrieved successfully',
        data: address,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Get('/list-address/:userId')
  async getListOfAddresses(@Param('userId') userId: string, @Res() res: Response) {
      try {
        const addresses = await this.addressService.getAddressesForUser(userId);
          return res.status(HttpStatus.OK).json({
          status_code: HttpStatus.OK,
          message: 'Addresses retrieved successfully',
          data: addresses,
        });
      } catch (error) {
        return this.handleError(error, res);
      }
    }
    
  @Delete('/delete-address/:addressId')
  async deleteAddress(@Param('addressId') addressId: string, @Res() res: Response) {
    try {
      const address = await this.addressService.getAddressById(addressId);
      if (!address) {
          throw new NotFoundException('Address not found');
      }

      await this.addressService.deleteAddress(addressId);
      return res.status(HttpStatus.OK).json({
          status_code: HttpStatus.OK,
          message: 'Address deleted successfully',
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
