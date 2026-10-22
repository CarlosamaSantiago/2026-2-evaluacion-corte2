import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { Company } from './entities/company.entity';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [CompanyController],
  imports: [
    TypeOrmModule.forFeature([Company]),
    UserModule 
  ],
  providers: [CompanyService],
})
export class CompanyModule { }
