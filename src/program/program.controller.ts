import { ProgramService } from './program.service';
import { Program } from './entities/program.entity';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

@ApiTags("Programs")
@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) { }

  @Get()
  @ApiOperation({ summary: "List programs", description: "Supports pagination with limit and skip" })
  @ApiOkResponse({ description: "Programs's list", type: [Program] })
  @ApiBadRequestResponse({ description: "Unauthorized. Forbidden. Bad request" })
  findAll() {
    return this.programService.findAll();
  }
  // TODO Reto 1: POST   /api/program               -> crear programa
  // TODO Reto 1: GET    /api/program               -> listar (paginado con PaginationDto)
  // TODO Reto 2: GET    /api/program/:id           -> programa con sus estudiantes
  // TODO Reto 2: PATCH  /api/program/:id/students  -> agregar estudiantes (acumulativo)
  // TODO Reto 3: POST   /api/program/bulk          -> crear programas en lote (todo o nada)
  // TODO Reto 4: proteger los POST y el PATCH para que solo un admin pueda usarlos
}
