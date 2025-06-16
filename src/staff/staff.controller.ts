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
import { ValidDatePipe } from '../common/pipes/validate-date.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'Create a staff member' })
  @ApiBody({ type: CreateStaffDto })
  @ApiResponse({ status: 201, description: 'Staff member created' })
  @ApiResponse({ status: 400, description: 'Invalid one or more fields' })
  @ApiResponse({
    status: 409,
    description: 'Staff member with this name already exists',
  })
  create(@Body() data: CreateStaffDto) {
    return this.staffService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of staff' })
  @ApiResponse({ status: 200, description: 'List of staff received' })
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a staff memberby id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Staff memberID' })
  @ApiResponse({ status: 200, description: 'Staff member received' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id/supervisor')
  @ApiOperation({ summary: 'Set a supervisor for a staff member' })
  @ApiParam({ name: 'id', type: 'string', description: 'Staff member ID' })
  @ApiBody({ type: SetSupervisorDto })
  @ApiResponse({ status: 200, description: 'Supervisor set' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  @ApiResponse({
    status: 404,
    description: 'Staff member or supervisor not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Staff member cannot be their own supervisor',
  })
  @ApiResponse({
    status: 409,
    description: 'EMPLOYEE cannot have subordinates',
  })
  @ApiResponse({ status: 409, description: 'Supervisor cannot be EMPLOYEE' })
  async setSupervisor(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SetSupervisorDto,
  ) {
    return this.staffService.setSupervisor(id, dto.supervisorId ?? null);
  }

  @Get(':id/subordinates')
  @ApiOperation({ summary: 'Get subordinates of a staff member' })
  @ApiParam({ name: 'id', type: 'string', description: 'Staff member ID' })
  @ApiResponse({ status: 200, description: 'List of subordinates received' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async getSubordinates(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.staffService.getSubordinates(id);
  }

  @Get(':id/salary')
  @ApiOperation({ summary: 'Get salary of a staff member' })
  @ApiParam({ name: 'id', type: 'string', description: 'Staff member ID' })
  @ApiQuery({
    name: 'at',
    required: false,
    description: 'Date, if not provided - current',
  })
  @ApiResponse({
    status: 200,
    description: 'Salary of a staff member received',
  })
  @ApiResponse({
    status: 400,
    description: 'Date cannot be before staff joinedAt date',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  @ApiResponse({ status: 400, description: 'Invalid date' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async getSalary(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('at', new ValidDatePipe()) at?: string,
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
  @ApiOperation({ summary: 'Get total salaries by company' })
  @ApiParam({ name: 'companyId', type: 'string', description: 'Company ID' })
  @ApiQuery({
    name: 'at',
    required: false,
    description: 'Date, if not provided - current',
  })
  @ApiResponse({
    status: 200,
    description: 'Total salaries by company received',
  })
  @ApiResponse({
    status: 400,
    description:
      'Date cannot be before staff joinedAt date for one of the staff members',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  @ApiResponse({ status: 400, description: 'Invalid date' })
  @ApiResponse({ status: 404, description: 'No staff found for this company' })
  async getTotalSalaries(
    @Param('companyId', new ParseUUIDPipe()) companyId: string,
    @Query('at', new ValidDatePipe()) at?: string,
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
