import { ArrayNotEmpty, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { CreateCompanyDto } from "./create-company.dto";

export class BulkCreateCompanyDto {
    @ApiProperty({
        description: "Companies to create. All or nothing: if one fails, none is created",
        type: [CreateCompanyDto],
        example: [
            { name: "Bancolombia", nit: "890903938-8", sector: "Finanzas" },
            { name: "Nutresa", nit: "890900050-1", sector: "Alimentos" }
        ]
    })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateCompanyDto)
    companies: CreateCompanyDto[];
}