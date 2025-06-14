import { StaffMember } from '../../../generated/prisma';

export interface ISalaryCalculator {
  isAvailableCalc(type: string): boolean;
  calculate(
    staff: StaffMember & { subordinates: StaffMember[] },
    at: Date,
  ): Promise<number>;
}
