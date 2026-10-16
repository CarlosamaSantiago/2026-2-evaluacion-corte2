// TODO Reto 2: reglas de validación con class-validator

import { IsUUID } from "class-validator";
import { Student } from "src/student/entities/student.entity";

//   - studentIds: arreglo NO vacío, cada elemento debe ser un UUID
export class AssignStudentsDto {
    @ApiProperty({ example: "UUID", description: "Program's id" })
    @IsString()
    @IsUUID
    id: string;

    @ApiProperty({
        example: [{ id: "UUID"}],
        description: "Students to be enrolled",
        type: () => [Student],
        required: false
    })
    @IsArray()
    students: Student[];

}
