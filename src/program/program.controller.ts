import { ProgramService } from './program.service';
import { Program } from './entities/program.entity';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { Auth } from '../user/decorators/auth.decorator';
import { ValidRoles } from '../user/enums/valid-roles.enum';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateProgramDto } from './dto/create-program.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';

@ApiTags("Programs")
@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) { }

  // TODO Reto 1: GET    /api/program               -> listar (paginado con PaginationDto)
  @Get()
  @ApiOperation({ summary: "List programs", description: "Supports pagination with limit and skip" })
  @ApiOkResponse({ description: "Programs's list", type: [Program] })
  @ApiBadRequestResponse({ description: "Unauthorized. Forbidden. Bad request" })
  findAll(@Query() PaginationDto: PaginationDto) {
    return this.programService.findAll(PaginationDto);
  }

  // TODO Reto 1: POST   /api/program               -> crear programa
  @Post()
  @Auth(ValidRoles.teacher)
  @ApiOperation({ summary: "Create a Program", description: "Requires the teacher role" })
  @ApiCreatedResponse({ description: "Program was created", type: Program })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  @ApiInternalServerErrorResponse({ description: "Program code already exists" })
    create(@Body() createProgramDto: CreateProgramDto){
    return this.programService.createProgram(createProgramDto);
  }




  // TODO Reto 2: GET    /api/program/:id           -> programa con sus estudiantes
  // TODO Reto 2: PATCH  /api/program/:id/students  -> agregar estudiantes (acumulativo)

  @Patch(":id")
  @ApiOperation({ summary: "Enroll a student", description: "If students are sent, they are enrolled to the program" })
  @ApiParam({ name: "id", description: "Program id (UUID)", format: "uuid" })
  @ApiOkResponse({ description: "Program was updated", type: Program })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  @ApiNotFoundResponse({ description: "Program not found" })
  update(@Param("id") id: string, @Body() assignStudentsDto: AssignStudentsDto) {
    return this.programService.enrollStudent(id, assignStudentsDto);
  }
  // TODO Reto 3: POST   /api/program/bulk          -> crear programas en lote (todo o nada)
  // TODO Reto 4: proteger los POST y el PATCH para que solo un admin pueda usarlos
}
