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

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  joinedAt: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  baseSalary?: number;

  @IsEnum(['EMPLOYEE', 'MANAGER', 'SALES'], {
    message: 'Invalid staff type (EMPLOYEE, MANAGER, SALES)',
  })
  @IsNotEmpty()
  type: 'EMPLOYEE' | 'MANAGER' | 'SALES';

  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsUUID()
  @IsOptional()
  supervisorId?: string;
}
