import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IStaffRepository } from './interfaces/staff.repository.interface';
import { StaffMember } from '../../generated/prisma';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffRepository implements IStaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateStaffDto): Promise<StaffMember> {
    return this.prisma.staffMember.create({ data });
  }

  findAll(): Promise<
    (StaffMember & {
      subordinates: StaffMember[];
      supervisor: StaffMember | null;
      company: any;
    })[]
  > {
    return this.prisma.staffMember.findMany({
      include: { subordinates: true, supervisor: true, company: true },
    });
  }

  findOne(id: string): Promise<
    | (StaffMember & {
        subordinates: StaffMember[];
        supervisor: StaffMember | null;
        company: any;
      })
    | null
  > {
    return this.prisma.staffMember.findUnique({
      where: { id },
      include: { subordinates: true, supervisor: true, company: true },
    });
  }

  findByCompany(id: string): Promise<StaffMember[]> {
    return this.prisma.staffMember.findMany({ where: { companyId: id } });
  }

  findWithSubordinates(
    id: string,
  ): Promise<(StaffMember & { subordinates: StaffMember[] }) | null> {
    return this.prisma.staffMember.findUnique({
      where: { id },
      include: { subordinates: true },
    });
  }

  async setSupervisor(
    staffId: string,
    supervisorId: string | null,
  ): Promise<StaffMember> {
    return this.prisma.staffMember.update({
      where: { id: staffId },
      data: { supervisorId },
    });
  }

  async getSubordinates(id: string): Promise<StaffMember[]> {
    return this.prisma.staffMember.findMany({
      where: { supervisorId: id },
    });
  }
}
