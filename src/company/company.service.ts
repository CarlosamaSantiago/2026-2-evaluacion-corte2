import { ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { User } from '../user/entities/user.entity';
import { BulkCreateCompanyDto } from './dto/bulk-create-company.dto';
import { CreateCompanyDto } from './dto/create-company.dto';


@Injectable()
export class CompanyService {

    private readonly logger = new Logger("CompanyService");

    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        private readonly datasource: DataSource
    ) { }

    async bulkCreate(bulkCreateCompanyDto: BulkCreateCompanyDto, user: User): Promise<Company[]> {
        const { companies } = bulkCreateCompanyDto;

        // 1. Repetidos DENTRO del mismo lote -> 409 antes de tocar la base de datos
        this.checkDuplicatesInBatch(companies);

        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 2. Crear las instancias, cada una con el admin que viene del token
            const newCompanies = companies.map(companyDto =>
                queryRunner.manager.create(Company, {
                    ...companyDto,
                    createdBy: user
                })
            );

            // 3. Guardarlas todas dentro de la transacción.
            //    Si un name o nit ya existe en la BD -> Postgres lanza 23505 -> catch -> rollback -> 409
            const savedCompanies = await queryRunner.manager.save(newCompanies);

            // 4. Todo salió bien: confirmar
            await queryRunner.commitTransaction();
            return savedCompanies;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.handleException(error);
        } finally {
            await queryRunner.release();
        }
    }

    private checkDuplicatesInBatch(companies: CreateCompanyDto[]) {
        const names = new Set<string>();
        const nits = new Set<string>();

        for (const company of companies) {
            if (names.has(company.name))
                throw new ConflictException(`Company name "${company.name}" is repeated in the batch`);
            if (nits.has(company.nit))
                throw new ConflictException(`Company NIT "${company.nit}" is repeated in the batch`);

            names.add(company.name);
            nits.add(company.nit);
        }
    }

    private handleException(error: any): never {
        if (error instanceof HttpException) throw error;

        this.logger.error(error);

        if (error.code === '23505') {
            throw new ConflictException(error.detail);
        }

        throw new InternalServerErrorException('Unexpected error, check server logs');
    }
}
