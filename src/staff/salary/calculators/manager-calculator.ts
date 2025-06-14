import { ISalaryCalculator } from '../salary-calculator.interface';
import { StaffMember } from '../../../../generated/prisma';

export class ManagerSalaryCalculator implements ISalaryCalculator {
  constructor(
    private readonly getSalary: (id: string, at: Date) => Promise<number>,
  ) {}

  isAvailableCalc(type: string): boolean {
    return type === 'MANAGER';
  }

  async calculate(
    staff: StaffMember & { subordinates: StaffMember[] },
    at: Date,
  ): Promise<number> {
    const years = Math.floor(
      (at.getTime() - staff.joinedAt.getTime()) / (365 * 24 * 60 * 60 * 1000),
    );
    const percent = Math.min(0.05 * years, 0.4);
    let salary = staff.baseSalary + staff.baseSalary * percent;

    const subSalaries = await Promise.all(
      staff.subordinates.map((s) => this.getSalary(s.id, at)),
    );

    salary += 0.005 * subSalaries.reduce((a, b) => a + b, 0);
    return Math.round(salary);
  }
}
