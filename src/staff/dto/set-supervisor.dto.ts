import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetSupervisorDto {
  @ApiProperty({ example: '48fceb7b-5d33-4d9c-af50-a683eb90b42b', description: 'Supervisor ID' })
  @IsUUID()
  @IsOptional()
  supervisorId?: string | null;
}
