import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ICompanyRepository } from './interfaces/company.repository.interface';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async create(dto: CreateCompanyDto) {
    try {
      return await this.companyRepository.create({ name: dto.name });
    } catch (error) {
      // we can create a function like 'findByName' and check if the company already exists (instead of catching the error by ORM code)
      // but in this case we can get race condition and 2 requests instead of 1
      if (error?.code === 'P2002') {
        throw new ConflictException('Company with this name already exists');
      }
      throw new InternalServerErrorException(error.message || 'Unknown error');
    }
  }

  async findAll() {
    return this.companyRepository.findAll();
  }

  async findOne(id: string) {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }
}
