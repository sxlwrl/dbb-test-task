import { ISalaryCalculator } from '../salary-calculator.interface';
import { StaffMember } from '../../../../generated/prisma';

export class SalesSalaryCalculator implements ISalaryCalculator {
  constructor(
    private readonly getAllSubordinateSalaries: (
      id: string,
      at: Date,
    ) => Promise<number>,
  ) {}

  isAvailableCalc(type: string): boolean {
    return type === 'SALES';
  }

  async calculate(staff: StaffMember, at: Date): Promise<number> {
    const years = Math.floor(
      (at.getTime() - staff.joinedAt.getTime()) / (365 * 24 * 60 * 60 * 1000),
    );
    const percent = Math.min(0.01 * years, 0.35);
    let salary = staff.baseSalary + staff.baseSalary * percent;

    const totalSubSalary = await this.getAllSubordinateSalaries(staff.id, at);
    salary += 0.003 * totalSubSalary;
    return Math.round(salary);
  }
}
