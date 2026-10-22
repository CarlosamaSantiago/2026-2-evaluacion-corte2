import { IsString, Matches, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCompanyDto {
    @ApiProperty({ example: "Bancolombia", description: "Company's name (unique)", minLength: 3 })
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty({ example: "890123456-7", description: "Company's NIT: 9 digits, hyphen, 1 digit (unique)", pattern: "^\\d{9}-\\d$" })
    @IsString()
    @Matches(/^\d{9}-\d$/, { message: "nit must have the format 123456789-0 (9 digits, hyphen, 1 digit)" })
    nit: string;

    @ApiProperty({ example: "Finanzas", description: "Company's sector" })
    @IsString()
    sector: string;
}