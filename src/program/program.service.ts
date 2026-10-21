import { ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { Student } from '../student/entities/student.entity';
import { User } from '../user/entities/user.entity';
import { PaginationDto } from './dto/pagination.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';

@Injectable()
export class ProgramService {

    // TODO Reto 1: inyecta el repositorio de Program (y lo que necesites para las transacciones)
    private readonly logger = new Logger("ProgramService");

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

    private handleException(error: any): never {
        // 1. Si ya es una excepción HTTP (404, 400, 409...) que lanzamos nosotros, se deja pasar tal cual
        if (error instanceof HttpException) throw error;

        this.logger.error(error);

        // 2. 23505 = unique_violation de Postgres -> el cliente envió un name/code que ya existe
        if (error.code === '23505') {
            throw new ConflictException(error.detail);
        }

        // 3. Cualquier otra cosa sí es un error del servidor: nunca devolver una respuesta vacía
        throw new InternalServerErrorException('Unexpected error, check server logs');
    }

    // TODO Reto 1: create(createProgramDto, user) -> guarda el programa
    //   - nombre o código repetido -> 409 Conflict (no 500) 
    async createProgram(createProgramDto: CreateProgramDto, user: User): Promise<Program> {
        try {
            const program = this.programRepository.create({
                ...createProgramDto,
                createdBy: user
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
    // Reto 2:  (id, dto) -> AGREGA estudiantes al programa (acumulativo) en una transacción
    async assignStudents(id: string, assignStudentsDto: AssignStudentsDto): Promise<Program> {
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Traer el programa CON los estudiantes que tiene hoy (dentro de la transacción)
            const program = await queryRunner.manager.findOne(Program, {
                where: { id },
                relations: { students: true }
            });
            if (!program) throw new NotFoundException(`Program with id ${id} not found`);

            // 2. Quitar ids repetidos dentro de la misma petición
            const uniqueIds = [...new Set(assignStudentsDto.studentIds)];

            // 3. Traer todos los estudiantes pedidos en UNA consulta y verificar que existan todos
            const requestedStudents = await queryRunner.manager.findBy(Student, { id: In(uniqueIds) });
            if (requestedStudents.length !== uniqueIds.length) {
                const foundIds = new Set(requestedStudents.map(student => student.id));
                const missingIds = uniqueIds.filter(studentId => !foundIds.has(studentId));
                throw new NotFoundException(`Students not found: ${missingIds.join(', ')}`);
            }

            // 4. Combinar: los actuales + solo los nuevos (los que ya estaban no se repiten)
            const currentStudents = program.students ?? [];
            const currentIds = new Set(currentStudents.map(student => student.id));
            const newStudents = requestedStudents.filter(student => !currentIds.has(student.id));
            program.students = [...currentStudents, ...newStudents];

            // 5. Guardar la lista COMPLETA con el manager de la transacción
            await queryRunner.manager.save(program);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.handleException(error);
        } finally {
            await queryRunner.release();
        }

        // 6. Ya confirmada la transacción, devolver el programa actualizado con sus estudiantes
        return this.findOne(id);
    }

    // Reto 2: findOne(id) -> programa con sus estudiantes, 404 si no existe
    async findOne(id: string): Promise<Program> {
        try {
            const program = await this.programRepository.findOne({
                where: { id },
                relations: { students: true }
            });

            if (!program)
                throw new NotFoundException(`Program with id ${id} not found`);

            return program;
        } catch (error) {
            this.handleException(error);
        }
    }
    // TODO Reto 3: bulkCreate(bulkCreateProgramDto, user) -> crea todos los programas o ninguno
    //   (transacción). Cualquier nombre/código repetido -> 409 y rollback.
}
