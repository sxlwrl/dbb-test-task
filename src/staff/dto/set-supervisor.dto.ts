import { IsUUID, IsOptional } from 'class-validator';

export class SetSupervisorDto {
  @IsUUID()
  @IsOptional()
  supervisorId?: string | null;
}
