import { CompanyService } from '../company.service';
import { ICompanyRepository } from '../interfaces/company.repository.interface';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from '../dto/create-company.dto';

describe('CompanyService', () => {
  let companyService: CompanyService;
  let companyRepository: jest.Mocked<ICompanyRepository>; // mocked repository

  beforeEach(() => {
    // mocked repository functions
    companyRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as any;
    companyService = new CompanyService(companyRepository);
  });

  it('should create a company', async () => {
    const data = {
      name: 'Google',
    };

    const mockCompany = {
      id: '1',
      ...data,
    };

    companyRepository.create.mockResolvedValue(mockCompany);

    expect(await companyService.create(data as CreateCompanyDto)).toEqual(
      mockCompany,
    );
  });

  it('should throw ConflictException if company with passed namealready exists', async () => {
    const data = {
      name: 'Google',
    };

    companyRepository.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      companyService.create(data as CreateCompanyDto),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw InternalServerErrorException on unknown error', async () => {
    const data = {
      name: 'Google',
    };

    companyRepository.create.mockRejectedValue({ message: 'Unknown error' });

    await expect(
      companyService.create(data as CreateCompanyDto),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should find and return all companies', async () => {
    const mockCompany = {
      id: '1',
      name: 'Google',
      staffMembers: [],
    };

    companyRepository.findAll.mockResolvedValue([mockCompany]);

    expect(await companyService.findAll()).toEqual([mockCompany]);
  });

  it('should find and return a company by id', async () => {
    const idToFind = '1';
    const mockCompany = {
      id: '1',
      name: 'Google',
      staffMembers: [],
    };

    companyRepository.findOne.mockResolvedValue(mockCompany);

    expect(await companyService.findOne(idToFind)).toEqual(mockCompany);
  });

  it('should throw NotFoundException if company not found', async () => {
    companyRepository.findOne.mockResolvedValue(null);

    await expect(companyService.findOne('1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
