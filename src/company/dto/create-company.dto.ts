import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Google', description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
}
