import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICompanyRepository } from './interfaces/company.repository.interface';
import { Company } from '../../generated/prisma';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any): Promise<Company> {
    return this.prisma.company.create({ data });
  }

  findAll(): Promise<(Company & { staffMembers: any[] })[]> {
    return this.prisma.company.findMany({ include: { staffMembers: true } });
  }

  findOne(id: string): Promise<(Company & { staffMembers: any[] }) | null> {
    return this.prisma.company.findUnique({
      where: { id },
      include: { staffMembers: true },
    });
  }
}
