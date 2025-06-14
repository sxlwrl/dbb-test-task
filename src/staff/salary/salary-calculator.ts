import { Injectable, Inject } from '@nestjs/common';
import { ISalaryCalculator } from './salary-calculator.interface';
import { EmployeeSalaryCalculator } from './calculators/employee-calculator';
import { ManagerSalaryCalculator } from './calculators/manager-calculator';
import { SalesSalaryCalculator } from './calculators/sales-calculator';
import { IStaffRepository } from '../interfaces/staff.repository.interface';

@Injectable()
export class SalaryCalculator {
  private calculators: ISalaryCalculator[];

  constructor(
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
  ) {
    this.calculators = [
      new EmployeeSalaryCalculator(),
      new ManagerSalaryCalculator((id, at) => this.getSalary(id, at)),
      new SalesSalaryCalculator((id, at) =>
        this.getAllSubordinateSalaries(id, at),
      ),
    ];
  }

  async getSalary(id: string, at: Date = new Date()): Promise<number> {
    const staff = await this.staffRepository.findWithSubordinates(id);
    if (!staff) throw new Error('Staff member not found');

    const calculator = this.calculators.find((s) =>
      s.isAvailableCalc(staff.type),
    );
    if (!calculator)
      throw new Error(`No calculators found for type ${staff.type}`);

    return calculator.calculate(staff, at);
  }

  async getAllSubordinateSalaries(id: string, at: Date): Promise<number> {
    const staff = await this.staffRepository.findWithSubordinates(id);
    if (!staff?.subordinates.length) return 0;

    let sum = 0;
    for (const sub of staff.subordinates) {
      sum += await this.getSalary(sub.id, at); // First level of subordinates
      sum += await this.getAllSubordinateSalaries(sub.id, at); // Recursive call for all subordinates
    }
    return sum;
  }
}
