import { Company } from '../../../generated/prisma';

export interface ICompanyRepository {
  create(data: any): Promise<Company>;
  findAll(): Promise<(Company & { staffMembers: any[] })[]>;
  findOne(id: string): Promise<(Company & { staffMembers: any[] }) | null>;
}
