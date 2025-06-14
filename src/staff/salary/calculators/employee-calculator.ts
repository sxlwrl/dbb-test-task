import { ISalaryCalculator } from '../salary-calculator.interface';
import { StaffMember } from '../../../../generated/prisma';

export class EmployeeSalaryCalculator implements ISalaryCalculator {
  isAvailableCalc(type: string): boolean {
    return type === 'EMPLOYEE';
  }

  async calculate(staff: StaffMember, at: Date): Promise<number> {
    const years = Math.floor(
      (at.getTime() - staff.joinedAt.getTime()) / (365 * 24 * 60 * 60 * 1000),
    );
    const percent = Math.min(0.03 * years, 0.3);
    return Math.round(staff.baseSalary + staff.baseSalary * percent);
  }
}
