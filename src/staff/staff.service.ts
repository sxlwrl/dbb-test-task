import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IStaffRepository } from './interfaces/staff.repository.interface';
import { SalaryCalculator } from './salary/salary-calculator';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
    private readonly salaryCalculator: SalaryCalculator,
  ) {}

  async create(data: CreateStaffDto) {
    try {
      return await this.staffRepository.create(data);
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Staff memberwith this name already exists');
      }
      throw new InternalServerErrorException(error.message || 'Unknown error');
    }
  }

  async findAll() {
    return await this.staffRepository.findAll();
  }

  async findOne(id: string) {
    const staff = await this.staffRepository.findOne(id);
    if (!staff) throw new NotFoundException('Staff member not found');
    return staff;
  }

  async findByCompany(companyId: string) {
    const staffList = await this.staffRepository.findByCompany(companyId);
    if (staffList.length === 0) {
      throw new NotFoundException('No staff found for this company');
    }
    return staffList;
  }

  async setSupervisor(staffId: string, supervisorId: string | null) {
    const staff = await this.staffRepository.findOne(staffId);
    if (!staff) throw new NotFoundException('Staff member not found');
    if (supervisorId) {
      if (staffId === supervisorId) {
        throw new ConflictException(
          'Staff member cannot be their own supervisor',
        );
      }
      const supervisor = await this.staffRepository.findOne(supervisorId);
      if (!supervisor) throw new NotFoundException('Supervisor not found');
      if (supervisor.type === 'EMPLOYEE') {
        throw new ConflictException('EMPLOYEE cannot have subordinates');
      }
    }
    return this.staffRepository.setSupervisor(staffId, supervisorId);
  }

  async getSubordinates(id: string) {
    const supervisor = await this.staffRepository.findOne(id);
    if (!supervisor) throw new NotFoundException('Supervisor not found');
    return this.staffRepository.getSubordinates(id);
  }

  async getSalary(id: string, at: Date) {
    await this.findOne(id);
    const salary = await this.salaryCalculator.getSalary(id, at);
    return { staffId: id, salary };
  }

  async getTotalSalariesByCompany(companyId: string, at: Date) {
    const staff = await this.staffRepository.findByCompany(companyId);
    const total = await Promise.all(
      staff.map((s) => this.salaryCalculator.getSalary(s.id, at)),
    );
    return { companyId, total: Math.round(total.reduce((a, b) => a + b, 0)) };
  }
}
