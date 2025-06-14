import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { SetSupervisorDto } from './dto/set-supervisor.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  create(@Body() data: CreateStaffDto) {
    return this.staffService.create(data);
  }

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id/supervisor')
  async setSupervisor(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SetSupervisorDto,
  ) {
    return this.staffService.setSupervisor(id, dto.supervisorId ?? null);
  }

  @Get(':id/subordinates')
  async getSubordinates(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.staffService.getSubordinates(id);
  }

  @Get(':id/salary')
  async getSalary(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('at') at?: string,
  ) {
    const staff = await this.staffService.findOne(id);
    // if date is not provided, use current date
    const date = at ? new Date(at) : new Date();
    // current date cannot be before joinedAt date
    if (date < staff.joinedAt) {
      throw new BadRequestException(
        'Date cannot be before staff joinedAt date',
      );
    }
    return this.staffService.getSalary(id, date);
  }

  @Get(':companyId/salaries')
  async getTotalSalaries(
    @Param('companyId', new ParseUUIDPipe()) companyId: string,
    @Query('at') at?: string,
  ) {
    const staffList = await this.staffService.findByCompany(companyId);
    const date = at ? new Date(at) : new Date();
    for (const staff of staffList) {
      if (date < staff.joinedAt) {
        throw new BadRequestException(
          'Date cannot be before staff joinedAt date for one of the staff members',
        );
      }
    }
    return this.staffService.getTotalSalariesByCompany(companyId, date);
  }
}
