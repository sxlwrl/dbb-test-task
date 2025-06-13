import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyRepository } from './company.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    CompanyService,
    {
      provide: 'ICompanyRepository',
      useClass: CompanyRepository,
    },
  ],
  controllers: [CompanyController],
  exports: [],
})
export class CompanyModule {}
