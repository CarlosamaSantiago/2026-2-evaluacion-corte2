import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Company {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "text",
        unique: true
    })
    name: string;

    @Column({
        type: "text",
        unique: true
    })
    nit: string;

    @Column("text")
    sector: string;
    
    @ManyToOne(
        () => User,
        { nullable: true }
    )
    createdBy?: User;
}