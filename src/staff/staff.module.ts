import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StaffRepository } from './staff.repository';
import { SalaryCalculator } from './salary/salary-calculator';

@Module({
  imports: [PrismaModule],
  providers: [
    StaffService,
    {
      provide: 'IStaffRepository',
      useClass: StaffRepository,
    },
    SalaryCalculator,
  ],
  controllers: [StaffController],
  exports: [],
})
export class StaffModule {}
