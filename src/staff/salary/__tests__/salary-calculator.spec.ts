import { SalaryCalculator } from '../salary-calculator';
import { EmployeeSalaryCalculator } from '../calculators/employee-calculator';
import { ManagerSalaryCalculator } from '../calculators/manager-calculator';
import { SalesSalaryCalculator } from '../calculators/sales-calculator';

function findById(staff, id) {
  if (staff.id === id) return staff;
  if (!staff.subordinates) return null;
  for (const sub of staff.subordinates) {
    const found = findById(sub, id);
    if (found) return found;
  }
  return null;
}

describe('EmployeeSalaryCalculator', () => {
  it('calculates employee salary', async () => {
    const employeeCalculator = new EmployeeSalaryCalculator();
    const staff = {
      id: '1',
      baseSalary: 500,
      joinedAt: new Date('2020-06-14'),
      type: 'EMPLOYEE',
    };
    // 5 years * 3% -> 15% (max 30%) -> 500 + 75 = 575
    expect(
      await employeeCalculator.calculate(staff as any, new Date('2025-06-14')),
    ).toBe(575);
  });
});

describe('ManagerSalaryCalculator', () => {
  it('calculates manager salary with subordinates', async () => {
    const employeeCalculator = new EmployeeSalaryCalculator();
    const staff = {
      id: '1',
      baseSalary: 500,
      joinedAt: new Date('2015-06-14'),
      type: 'MANAGER',
      subordinates: [
        {
          id: '2',
          baseSalary: 500,
          joinedAt: new Date('2020-06-14'),
          type: 'EMPLOYEE',
          subordinates: [],
        },
        {
          id: '3',
          baseSalary: 500,
          joinedAt: new Date('2020-06-14'),
          type: 'EMPLOYEE',
          subordinates: [],
        },
      ],
    };

    const getSalary = (id: string, at: Date) => {
      const sub = findById(staff, id);
      return employeeCalculator.calculate(sub as any, at);
    };

    const managerCalculator = new ManagerSalaryCalculator(getSalary);
    // 5 years * 3% -> 15% (max 30%) -> 500 + 75 = 575
    // 0.5% (575) -> 2.875 * 2 = 5.75 + 700 = 705.75 -> 706
    expect(
      await managerCalculator.calculate(staff as any, new Date('2025-06-14')),
    ).toBe(706);
  });

  it('calculates manager salary without subordinates', async () => {
    const employeeCalculator = new EmployeeSalaryCalculator();
    const staff = {
      id: '1',
      baseSalary: 500,
      joinedAt: new Date('2015-06-14'),
      type: 'MANAGER',
      subordinates: [],
    };

    // Call manager salary calculator
    // subSalaries returns [] bcs map is empty
    // reduce returns 0
    // salary += 0.005 * 0 = 0

    const getSalary = (id: string, at: Date) => {
      const sub = findById(staff, id);
      return employeeCalculator.calculate(sub as any, at);
    };

    const managerCalculator = new ManagerSalaryCalculator(getSalary);
    // 10 years * 5% -> 50% (max 40%) -> 500 + 200 = 700
    expect(
      await managerCalculator.calculate(staff as any, new Date('2025-06-14')),
    ).toBe(700);
  });
});

describe('SalesSalaryCalculator', () => {
  it('calculates sales salary with subordinates', async () => {
    // 1 sales -> 2 managers -> 2 employees (each)
    const employeeCalculator = new EmployeeSalaryCalculator();
    const managerCalculator = new ManagerSalaryCalculator((id, at) =>
      getSalary(id, at),
    );
    let salesCalculator: SalesSalaryCalculator;
    const staff = {
      id: '1',
      baseSalary: 500,
      joinedAt: new Date('2005-06-14'),
      type: 'SALES',
      subordinates: [
        {
          id: '2',
          baseSalary: 500,
          joinedAt: new Date('2015-06-14'),
          type: 'MANAGER',
          subordinates: [
            {
              id: '4',
              baseSalary: 500,
              joinedAt: new Date('2020-06-14'),
              type: 'EMPLOYEE',
              subordinates: [],
            },
            {
              id: '5',
              baseSalary: 500,
              joinedAt: new Date('2020-06-14'),
              type: 'EMPLOYEE',
              subordinates: [],
            },
          ],
        },
        {
          id: '3',
          baseSalary: 500,
          joinedAt: new Date('2015-06-14'),
          type: 'MANAGER',
          subordinates: [
            {
              id: '6',
              baseSalary: 500,
              joinedAt: new Date('2020-06-14'),
              type: 'EMPLOYEE',
              subordinates: [],
            },
            {
              id: '7',
              baseSalary: 500,
              joinedAt: new Date('2020-06-14'),
              type: 'EMPLOYEE',
              subordinates: [],
            },
          ],
        },
      ],
    };

    const getSalary = (id: string, at: Date) => {
      const sub = findById(staff, id);
      if (sub.type === 'EMPLOYEE')
        return employeeCalculator.calculate(sub as any, at);
      if (sub.type === 'MANAGER')
        return managerCalculator.calculate(sub as any, at);
      if (sub.type === 'SALES')
        return salesCalculator.calculate(sub as any, at);
    };

    async function getAllSubSalaries(id: string, at: Date) {
      const sub = findById(staff, id);
      if (!sub?.subordinates?.length) return 0;
      let sum = 0;
      for (const s of sub.subordinates) {
        sum += await getSalary(s.id, at);
        sum += await getAllSubSalaries(s.id, at);
      }
      return sum;
    }

    salesCalculator = new SalesSalaryCalculator(getAllSubSalaries);
    // E salary = 575 * 4 = 2300
    // M salary = 706 * 2 = 1412
    // S salary = 500 + (500 * 0.2) + (3712 * 0.003) = 611
    expect(
      await salesCalculator.calculate(staff as any, new Date('2025-06-14')),
    ).toBe(611);
  });

  it('calculates sales salary without subordinates', async () => {
    const employeeCalculator = new EmployeeSalaryCalculator();
    const managerCalculator = new ManagerSalaryCalculator((id, at) =>
      getSalary(id, at),
    );
    let salesCalculator: SalesSalaryCalculator;
    const staff = {
      id: '1',
      baseSalary: 500,
      joinedAt: new Date('2005-06-14'),
      type: 'SALES',
      subordinates: [],
    };

    const getSalary = (id: string, at: Date) => {
      const sub = findById(staff, id);
      if (sub.type === 'EMPLOYEE')
        return employeeCalculator.calculate(sub as any, at);
      if (sub.type === 'MANAGER')
        return managerCalculator.calculate(sub as any, at);
      if (sub.type === 'SALES')
        return salesCalculator.calculate(sub as any, at);
    };

    async function getAllSubSalaries(id: string, at: Date) {
      const sub = findById(staff, id);
      if (!sub?.subordinates?.length) return 0;
      let sum = 0;
      for (const s of sub.subordinates) {
        sum += await getSalary(s.id, at);
        sum += await getAllSubSalaries(s.id, at);
      }
      return sum;
    }

    salesCalculator = new SalesSalaryCalculator(getAllSubSalaries);
    // 500 + (500 * 0.2) = 600
    expect(
      await salesCalculator.calculate(staff as any, new Date('2025-06-14')),
    ).toBe(600);
  });
});

describe('SalaryCalculator', () => {
  let staffRepository: any;
  let calculator: SalaryCalculator;
  beforeEach(() => {
    staffRepository = {
      findWithSubordinates: jest.fn(),
    };
    calculator = new SalaryCalculator(staffRepository);
  });

  it('throws error if staff not found', async () => {
    staffRepository.findWithSubordinates.mockResolvedValue(null);

    await expect(calculator.getSalary('1', new Date())).rejects.toThrow(
      'Staff member not found',
    );
  });

  it('throws error if no calculator found for staff type', async () => {
    staffRepository.findWithSubordinates.mockResolvedValue({
      type: 'TEST',
    });

    await expect(calculator.getSalary('1', new Date())).rejects.toThrow(
      'No calculators found for type TEST',
    );
  });
});
