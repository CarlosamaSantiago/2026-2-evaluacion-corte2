import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { BulkCreateCompanyDto } from './dto/bulk-create-company.dto';
import { Auth } from '../user/decorators/auth.decorator';
import { ValidRoles } from '../user/enums/valid-roles.enum';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';


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

}