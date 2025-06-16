import { StaffService } from '../staff.service';
import { IStaffRepository } from '../interfaces/staff.repository.interface';
import { SalaryCalculator } from '../salary/salary-calculator';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateStaffDto } from '../dto/create-staff.dto';

enum StaffType {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  SALES = 'SALES',
}

describe('StaffService', () => {
  let staffService: StaffService;
  let staffRepository: jest.Mocked<IStaffRepository>; // mocked repository
  let salaryCalculator: jest.Mocked<SalaryCalculator>; // mocked calculator

  beforeEach(() => {
    // mocked repository functions
    staffRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByCompany: jest.fn(),
      setSupervisor: jest.fn(),
      getSubordinates: jest.fn(),
      findWithSubordinates: jest.fn(),
    } as any;

    // mocked calculator functions
    salaryCalculator = {
      getSalary: jest.fn(),
      getAllSubordinateSalaries: jest.fn(),
    } as any;

    staffService = new StaffService(staffRepository, salaryCalculator);
  });

  it('should create a staff member', async () => {
    const data = {
      name: 'Test Name',
      joinedAt: '2020-06-14',
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
    };

    const mockStaff = {
      id: '1',
      ...data,
      joinedAt: new Date('2020-06-14'),
      subordinates: [],
      supervisor: null,
      company: {},
    };

    staffRepository.create.mockResolvedValue(mockStaff); // staffRepository returns mocked object

    expect(await staffService.create(data as CreateStaffDto)).toEqual(
      mockStaff,
    ); // check if staffService returns mocked object
  });

  it('should throw ConflictException if staff with passed name already exists', async () => {
    const data = {
      name: 'Test',
      joinedAt: '2020-06-14',
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
    };

    staffRepository.create.mockRejectedValue({ code: 'P2002' });

    await expect(staffService.create(data as CreateStaffDto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should throw InternalServerErrorException on unknown error', async () => {
    const data = {
      name: 'Test',
      joinedAt: '2020-06-14',
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
    };

    staffRepository.create.mockRejectedValue({ message: 'Unknown error' });

    await expect(staffService.create(data as CreateStaffDto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should find and return all staff', async () => {
    const mockStaff = {
      id: '1',
      name: 'Test Name',
      joinedAt: new Date('2020-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    staffRepository.findAll.mockResolvedValue([mockStaff]);

    expect(await staffService.findAll()).toEqual([mockStaff]);
  });

  it('should find and return a staff member by id', async () => {
    const idToFind = '1';
    const mockStaff = {
      id: '1',
      name: 'Test Name',
      joinedAt: new Date('2020-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    staffRepository.findOne.mockResolvedValue(mockStaff);

    expect(await staffService.findOne(idToFind)).toEqual(mockStaff);
  });

  it('should throw NotFoundException if staff member not found', async () => {
    staffRepository.findOne.mockResolvedValue(null);

    await expect(staffService.findOne('1')).rejects.toThrow(NotFoundException);
  });

  it('should set a supervisor', async () => {
    const mockStaff = {
      id: '1',
      name: 'Test Name',
      joinedAt: new Date('2020-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    const mockSupervisor = {
      id: '2',
      name: 'Test Name2',
      joinedAt: new Date('2010-06-14'),
      type: StaffType.MANAGER,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    const updatedStaff = {
      ...mockStaff,
      supervisorId: '2',
    };

    staffRepository.findOne
      .mockResolvedValueOnce(mockStaff)
      .mockResolvedValueOnce(mockSupervisor);

    staffRepository.setSupervisor.mockResolvedValue(updatedStaff);

    expect(await staffService.setSupervisor('1', '2')).toEqual(updatedStaff);
  });

  it('should throw ConflictException if staff member is their own supervisor', async () => {
    const mockStaff = {
      id: '1',
      name: 'Test Name',
      joinedAt: new Date('2020-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    staffRepository.findOne.mockResolvedValue(mockStaff);

    await expect(staffService.setSupervisor('1', '1')).rejects.toThrow(
      ConflictException,
    );
  });

  it('should throw if supervisor not found', async () => {
    const mockStaff = {
      id: '1',
      name: 'Test Name',
      joinedAt: new Date('2020-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    staffRepository.findOne
      .mockResolvedValueOnce(mockStaff)
      .mockResolvedValueOnce(null);

    await expect(staffService.setSupervisor('1', '2')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw if supervisor is EMPLOYEE', async () => {
    const mockStaff = {
      id: '1',
      name: 'Test Name',
      joinedAt: new Date('2020-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    const mockPotentialSupervisor = {
      id: '2',
      name: 'Test Name2',
      joinedAt: new Date('2010-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    staffRepository.findOne
      .mockResolvedValueOnce(mockStaff)
      .mockResolvedValueOnce(mockPotentialSupervisor);

    await expect(staffService.setSupervisor('1', '2')).rejects.toThrow(
      ConflictException,
    );
  });

  it('should get all subordinates', async () => {
    const mockStaff = {
      id: '1',
      name: 'Test Name',
      joinedAt: new Date('2010-06-14'),
      type: StaffType.MANAGER,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    const mockSubordinate = {
      id: '2',
      name: 'Test Name2',
      joinedAt: new Date('2020-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: '1',
      subordinates: [],
      supervisor: mockStaff,
      company: {},
    };

    mockStaff.subordinates = [mockSubordinate];

    staffRepository.findOne.mockResolvedValue(mockStaff);

    staffRepository.getSubordinates.mockResolvedValue([mockSubordinate]);

    expect(await staffService.getSubordinates('1')).toEqual([mockSubordinate]);
  });

  it('should throw NotFoundException if supervisor not found', async () => {
    staffRepository.findOne.mockResolvedValue(null);

    await expect(staffService.getSubordinates('1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should get staff salary', async () => {
    const mockStaff = {
      id: '1',
      name: 'Test Name',
      joinedAt: new Date('2020-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    staffRepository.findOne.mockResolvedValue(mockStaff);

    salaryCalculator.getSalary.mockResolvedValue(575); // 500 + (500 * 0.15) = 575

    expect(await staffService.getSalary('1', new Date('2025-06-14'))).toEqual({
      staffId: '1',
      salary: 575,
    });
  });

  it('should get a total salary', async () => {
    const firstMockStaff = {
      id: '1',
      name: 'Test Name',
      joinedAt: new Date('2020-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    const secondMockStaff = {
      id: '2',
      name: 'Test Name2',
      joinedAt: new Date('2020-06-14'),
      type: StaffType.EMPLOYEE,
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      baseSalary: 500,
      supervisorId: null,
      subordinates: [],
      supervisor: null,
      company: {},
    };

    staffRepository.findByCompany.mockResolvedValue([
      firstMockStaff,
      secondMockStaff,
    ]);

    salaryCalculator.getSalary
      .mockResolvedValueOnce(575)
      .mockResolvedValueOnce(575);

    expect(
      await staffService.getTotalSalariesByCompany(
        '8030fd18-6918-46db-be2a-93846e44b85a',
        new Date('2025-06-14'),
      ),
    ).toEqual({
      companyId: '8030fd18-6918-46db-be2a-93846e44b85a',
      total: 1150,
    });
  });
});
