import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { BulkCreateCompanyDto } from './dto/bulk-create-company.dto';
import { Auth } from '../user/decorators/auth.decorator';
import { ValidRoles } from '../user/enums/valid-roles.enum';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { PaginationDto } from '../student/dto/pagination.dto';


@ApiTags("Companies")
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Post("bulk")
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: "Create companies in bulk", description: "Requires the admin role. All or nothing: if one company fails, none is created" })
  @ApiCreatedResponse({ description: "All companies were created", type: [Company] })
  @ApiBadRequestResponse({ description: "Empty batch or some company is invalid" })
  @ApiConflictResponse({ description: "Some name or NIT already exists or is repeated in the batch" })
  bulkCreate(
    @Body() bulkCreateCompanyDto: BulkCreateCompanyDto,
    @GetUser() user: User
  ) {
    return this.companyService.bulkCreate(bulkCreateCompanyDto, user);
  }

  @Get()
  @ApiOperation({ summary: "List companies", description: "Public. Supports pagination with limit and skip" })
  @ApiOkResponse({ description: "Companies list", type: [Company] })
  @ApiBadRequestResponse({ description: "Invalid pagination params" })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.companyService.findAll(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Find a company", description: "Public. Search by id (UUID)" })
  @ApiParam({ name: "id", description: "Company id (UUID)", format: "uuid" })
  @ApiOkResponse({ description: "Company found", type: Company })
  @ApiBadRequestResponse({ description: "id is not a valid UUID" })
  @ApiNotFoundResponse({ description: "Company not found" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.companyService.findOne(id);
  }

}