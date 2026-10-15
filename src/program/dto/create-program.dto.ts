// TODO Reto 1: reglas de validación con class-validator
//   - name: string, mínimo 3 caracteres
//   - code: string de 3 a 6 letras MAYÚSCULAS (ej. "SIS", "MED")
//   - credits: entero positivo

import {IsString, MaxLength, MinLength, Min, IsNumber, IsPositive } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProgramDto {
    @ApiProperty({ example: "Ingenieria de Sistemas", description: "Program's name", minLength: 8 })
    @IsString()
    name: string;

    @ApiProperty({ example: "SIS", description: "Program's code", minLength: 3, maxLength: 6 })
    @IsString()
    @Min(3)
    code: string;

    @ApiProperty({ example: 3, description: "Program's credit" })
    @IsNumber()
    @IsPositive()
    credits: number;
}
