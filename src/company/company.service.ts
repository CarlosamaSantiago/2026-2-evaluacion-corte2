import { ConflictException, HttpException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {

    private readonly logger = new Logger("CompanyService");

    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        private readonly datasource: DataSource
    ) { }

    private handleException(error: any): never {
        if (error instanceof HttpException) throw error;

        this.logger.error(error);

        if (error.code === '23505') {
            throw new ConflictException(error.detail);
        }

        throw new InternalServerErrorException('Unexpected error, check server logs');
    }
}
