import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Company')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Company created' })
  @ApiResponse({ status: 400, description: 'Invalid one or more fields' })
  @ApiResponse({ status: 409, description: 'Company with this name already exists' })
  create(@Body() data: CreateCompanyDto) {
    return this.companyService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'List of companies received' })
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company received' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.companyService.findOne(id);
  }
}
