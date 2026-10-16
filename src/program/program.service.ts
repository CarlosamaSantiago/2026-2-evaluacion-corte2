import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { PaginationDto } from './dto/pagination.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { isUUID } from 'class-validator';
import { AssignStudentsDto } from './dto/assign-students.dto';

@Injectable()
export class ProgramService {

    // TODO Reto 1: inyecta el repositorio de Program (y lo que necesites para las transacciones)
    private readonly logger = new Logger("StudentService");

    constructor(
        @InjectRepository(Program)
        private readonly programRepository: Repository<Program>,
        private datasource: DataSource
    ) { }

    // TODO Reto 1: findAll(paginationDto) -> lista paginada (limit / skip)
    async findAll(paginationDto: PaginationDto) {
        try {
            const { skip, limit } = paginationDto;
            return await this.programRepository.find({
                take: limit,
                skip: skip
            });
        } catch (error) {
            this.handleException(error);
        }
    }

    private handleException(error: any) {
        this.logger.error(error);
        if (error.code === '23505') {
            throw new InternalServerErrorException(error.detail);
        }
    }


    // TODO Reto 1: create(createProgramDto, user) -> guarda el programa
    //   - nombre o código repetido -> 409 Conflict (no 500)
    async createProgram(createProgramDto: CreateProgramDto): Promise<Program | undefined> {
        try {
            const { ...programDetails } = createProgramDto;
            const program = this.programRepository.create({
                ...programDetails,
            });
            await this.programRepository.save(program);
            return program;
        } catch (error) {
            this.handleException(error);
        }
    }



    // TODO Reto 2: findOne(id) -> programa con sus estudiantes, 404 si no existe

    // TODO Reto 2: assignStudents(id, assignStudentsDto) -> AGREGA estudiantes al programa
    //   dentro de una transacción (QueryRunner), conservando los que ya tenía.
    //   Mismo patrón del update de estudiantes corregido en clase (combinar las notas):
    //   traer los actuales -> combinar con los nuevos -> guardar la lista completa.
    //   Si algún id no existe: 404 y rollback.
    async enrollStudent(id: string, assignStudentsDto: AssignStudentsDto) {
        const { students, ...programDetails } = assignStudentsDto;
        const program = await this.programRepository.preload({
            id: id,
            ...programDetails
        })

        if (!program) throw new NotFoundException(`Program with id ${id} not found`);

        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (students) {
                program.students = students.map(student => this.programRepository.insert(student));
            }

            await queryRunner.manager.save(program);
            await queryRunner.commitTransaction();
            await queryRunner.release();

            return await this.findOne(program.id);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            this.handleException(error);
        }

    }

    async findOne(term: string) {
        let program: Program | null;
        try {
            if (isUUID(term)) {
                program = await this.programRepository.findOneBy({ id: term });
            } else{
                program = null;
            }

            if (!program)
                throw new NotFoundException(`Student with ${term} not found`);

            return program;

        } catch (error) {
            this.handleException(error);
        }
    }
    // TODO Reto 3: bulkCreate(bulkCreateProgramDto, user) -> crea todos los programas o ninguno
    //   (transacción). Cualquier nombre/código repetido -> 409 y rollback.
}
