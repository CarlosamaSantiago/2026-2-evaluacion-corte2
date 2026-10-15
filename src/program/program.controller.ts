import { ProgramService } from './program.service';
import { Program } from './entities/program.entity';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { Auth } from 'src/user/decorators/auth.decorator';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateProgram, CreateProgramDto } from './dto/create-program.dto';

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
  create(@Body() createProgramDto: CreateProgram) {
    return this.programService.createProgram(createProgramDto);
  }


  
  
  // TODO Reto 2: GET    /api/program/:id           -> programa con sus estudiantes
  // TODO Reto 2: PATCH  /api/program/:id/students  -> agregar estudiantes (acumulativo)
  // TODO Reto 3: POST   /api/program/bulk          -> crear programas en lote (todo o nada)
  // TODO Reto 4: proteger los POST y el PATCH para que solo un admin pueda usarlos
}
