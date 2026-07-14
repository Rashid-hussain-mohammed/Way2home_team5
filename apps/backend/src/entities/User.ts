import { Entity, PrimaryKey, Property, Enum } from "@mikro-orm/mysql";
import { v4 } from "uuid";
import type { IUser } from "@gdsd/common/models";
import { Role } from "@gdsd/common/models";
import { Gender } from "@gdsd/common/models"; 

@Entity()
export class User implements IUser {
    @PrimaryKey({ type: "uuid" })
    id = v4();

    @Property()
    firstName!: string;

    @Property()
    lastName!: string;

    @Property()
    email!: string;

    @Property({ hidden: true })
    password!: string

    @Enum(() => Gender)
    gender!: Gender;

    @Property()
    birthDate!: Date;

    @Property({ nullable: true })
    phone!: string;

    @Property()
    creationDate: Date = new Date();

    @Property({ nullable: true })
    avatar?: string;

    @Enum(() => Role)
    role!: Role;

    @Property({ nullable: true })
    about?: string;
}
