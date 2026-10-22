// TODO Reto 3: reglas de validación con class-validator / class-transformer
//   - programs: arreglo NO vacío de CreateProgramDto
//   - cada elemento se debe validar con las mismas reglas de CreateProgramDto
//     (pista: @ValidateNested({ each: true }) + @Type(() => CreateProgramDto))
import { ArrayNotEmpty, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { CreateProgramDto } from "./create-program.dto";

export class BulkCreateProgramDto {
    @ApiProperty({
        description: "Programs to create. All or nothing: if one fails, none is created",
        type: [CreateProgramDto],
        example: [
            { name: "Arquitectura", code: "ARQ", credits: 170 },
            { name: "Derecho", code: "DER", credits: 165 }
        ]
    })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateProgramDto)
    programs: CreateProgramDto[];
}