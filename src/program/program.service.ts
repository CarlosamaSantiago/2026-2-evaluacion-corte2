import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';

@Injectable()
export class ProgramService {

    // TODO Reto 1: inyecta el repositorio de Program (y lo que necesites para las transacciones)
    private readonly logger = new Logger("StudentService");

    constructor(
        @InjectRepository(Program)
        private readonly programRepository: Repository<Program>,
        private datasource: DataSource
    ) { }


    async findAll() {
        try {
            return await this.programRepository.find({
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

    // TODO Reto 1: findAll(paginationDto) -> lista paginada (limit / skip)

    // TODO Reto 2: findOne(id) -> programa con sus estudiantes, 404 si no existe

    // TODO Reto 2: assignStudents(id, assignStudentsDto) -> AGREGA estudiantes al programa
    //   dentro de una transacción (QueryRunner), conservando los que ya tenía.
    //   Mismo patrón del update de estudiantes corregido en clase (combinar las notas):
    //   traer los actuales -> combinar con los nuevos -> guardar la lista completa.
    //   Si algún id no existe: 404 y rollback.

    // TODO Reto 3: bulkCreate(bulkCreateProgramDto, user) -> crea todos los programas o ninguno
    //   (transacción). Cualquier nombre/código repetido -> 409 y rollback.
}
