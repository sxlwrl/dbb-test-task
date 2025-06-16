import {
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidDate } from '../../common/validators/date-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'Alex Kovalenko', description: 'Staff name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2024-07-14', description: 'Date of employment' })
  @IsDateString()
  @IsNotEmpty()
  @IsValidDate({ message: 'joinedAt cannot be in the future' })
  joinedAt: string;

  @ApiProperty({ example: 500, description: 'Base salary' })
  @IsInt()
  @Min(0)
  @IsOptional()
  baseSalary?: number;

  @ApiProperty({
    example: 'EMPLOYEE',
    enum: ['EMPLOYEE', 'MANAGER', 'SALES'],
    description: 'Employee type',
  })
  @IsEnum(['EMPLOYEE', 'MANAGER', 'SALES'], {
    message: 'Invalid staff type (EMPLOYEE, MANAGER, SALES)',
  })
  @IsNotEmpty()
  type: 'EMPLOYEE' | 'MANAGER' | 'SALES';

  @ApiProperty({
    example: '8030fd18-6918-46db-be2a-93846e44b85a',
    description: 'Company ID',
  })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({
    example: '48fceb7b-5d33-4d9c-af50-a683eb90b42b',
    description: 'Supervisor ID',
  })
  @IsUUID()
  @IsOptional()
  supervisorId?: string;
}
