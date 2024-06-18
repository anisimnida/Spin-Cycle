import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}
  
  async createAddress(userId: string, createAddressDto: CreateAddressDto): Promise<any> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const addressCount = await this.prisma.address.count({
      where: { userId },
    });

    if (addressCount === 0) {
      createAddressDto.isMain = true;
    } else if (createAddressDto.isMain) {
      // If an address is already set as the main, unset the current main address
      await this.unsetCurrentMainAddress(userId);
    }

    // Create the new address
    const newAddress = await this.prisma.address.create({
      data: {
        ...createAddressDto,
        userId,
      },
    });

    return newAddress;
    } catch (error) {
      throw error;
    }
    
  }

  async switchMainAddress(userId: string, addressId: string): Promise<any> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const address = await this.prisma.address.findUnique({
        where: { id: addressId },
      });
  
      if (!address || address.userId !== userId) {
        throw new NotFoundException('Address not found or does not belong to the user');
      }
  
      await this.unsetCurrentMainAddress(userId);
  
      const updatedAddress = await this.prisma.address.update({
        where: { id: addressId },
        data: { isMain: true },
      });
  
      return updatedAddress;
    } catch (error) {
      throw error ;
    }
  }

  async getAddressesForUser(userId: string): Promise<any[]> {
    try {
        const userWithAddresses = await this.prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                address: {
                    select: {
                        id: true,
                        street: true,
                        city: true,
                        district: true,
                        province: true,
                        country: true,
                        postalCode: true,
                        detail: true,
                        isMain: true,
                        latitude: true,
                        longitude: true,
                    },
                },
            },
        });

        if (!userWithAddresses) {
            throw new NotFoundException('User not found');
        }

        return userWithAddresses.address;
    } catch (error) {
        throw error;
    }
  }

  async getAddressById(addressId: string): Promise<any> {
    try {
      const address = await this.prisma.address.findUnique({
        where: { id: addressId },
        select: {
          id: true,
          street: true,
          city: true,
          district: true,
          province: true,
          country: true,
          postalCode: true,
          detail: true,
          isMain: true,
          latitude: true,
          longitude: true,
        },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      return address;
    } catch (error) {
      throw error;
    }
  }

  async updateAddress(addressId: string, updateAddressDto: UpdateAddressDto): Promise<any> {
    try {
      const address = await this.prisma.address.findUnique({
        where: { id: addressId },
      });
  
      if (!address) {
        throw new NotFoundException('Address not found');
      }
  
      const updatedAddress = await this.prisma.address.update({
        where: { id: addressId },
        data: updateAddressDto,
      });
  
      return updatedAddress;
    } catch (error) {
      throw error;
    }
  }
  
  async deleteAddress(addressId: string): Promise<any> {
    try {
      const address = await this.prisma.address.findUnique({
        where: { id: addressId },
      });
  
      if (!address) {
        throw new NotFoundException('Address not found');
      }
  
      await this.prisma.address.delete({
        where: { id: addressId },
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  private async unsetCurrentMainAddress(userId: string) {
    await this.prisma.address.updateMany({
      where: { userId, isMain: true },
      data: { isMain: false },
    });
  }
}
