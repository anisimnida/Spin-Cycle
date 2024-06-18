import { PartialType } from '@nestjs/swagger';
import { CreateLaundryDto } from './create-laundry.dto';

export class UpdateLaundryDto extends PartialType(CreateLaundryDto) {}
