// TODO Reto 1: reglas de validación con class-validator
//   - name: string, mínimo 3 caracteres
//   - code: string de 3 a 6 letras MAYÚSCULAS (ej. "SIS", "MED")
//   - credits: entero positivo

import { IsInt, IsPositive, IsString, Matches, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProgramDto {
    @ApiProperty({ example: "Ingenieria de Sistemas", description: "Program's name", minLength: 3 })
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty({ example: "SIS", description: "Program's code: 3 to 6 uppercase letters", pattern: "^[A-Z]{3,6}$" })
    @IsString()
    @Matches(/^[A-Z]{3,6}$/, { message: "code must be 3 to 6 uppercase letters (A-Z)" })
    code: string;

    @ApiProperty({ example: 160, description: "Program's credits (positive integer)", minimum: 1 })
    @IsInt()
    @IsPositive()
    credits: number;
}
