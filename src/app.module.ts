import { Module } from '@nestjs/common';
import { CompanyModule } from './company/company.module';
import { StaffModule } from './staff/staff.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CompanyModule,
    StaffModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [],
})
export class AppModule {}
