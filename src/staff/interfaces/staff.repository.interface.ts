import { StaffMember } from '../../../generated/prisma';
import { CreateStaffDto } from '../dto/create-staff.dto';

export interface IStaffRepository {
  create(data: CreateStaffDto): Promise<StaffMember>;
  findAll(): Promise<
    (StaffMember & {
      subordinates: StaffMember[];
      supervisor: StaffMember | null;
      company: any;
    })[]
  >;
  findOne(id: string): Promise<
    | (StaffMember & {
        subordinates: StaffMember[];
        supervisor: StaffMember | null;
        company: any;
      })
    | null
  >;
  findByCompany(id: string): Promise<StaffMember[]>;
  findWithSubordinates(
    id: string,
  ): Promise<(StaffMember & { subordinates: StaffMember[] }) | null>;
  setSupervisor(
    staffId: string,
    supervisorId: string | null,
  ): Promise<StaffMember>;
  getSubordinates(id: string): Promise<StaffMember[]>;
}
