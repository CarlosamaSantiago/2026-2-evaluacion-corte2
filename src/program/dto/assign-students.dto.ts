// TODO Reto 2: reglas de validación con class-validator

import { ArrayNotEmpty, IsArray, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

//   - studentIds: arreglo NO vacío, cada elemento debe ser un UUID
export class AssignStudentsDto {
    @ApiProperty({
        example: ["4fcfc5ab-7902-478f-b173-b8f1e751af12", "9b2f1c3e-2a4d-4e8b-9f1a-6c7d8e9f0a1b"],
        description: "Ids of the students to add to the program (they are added, not replaced)",
        type: [String],
        format: "uuid"
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('4', { each: true })
    studentIds: string[];

}
