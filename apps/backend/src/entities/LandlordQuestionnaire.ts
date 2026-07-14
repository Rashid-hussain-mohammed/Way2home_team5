import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/mysql";
import { v4 } from "uuid";
import { User } from "./User";
import type { ILandlordQuestionnaire } from "@gdsd/common/models";

@Entity()
export class LandlordQuestionnaire implements ILandlordQuestionnaire{
  @PrimaryKey({ type: "uuid" })
  id: string = v4();

  @Property({ type: "datetime", defaultRaw: "CURRENT_TIMESTAMP" })
  creationDate: Date = new Date();

  @Property()
  landlordId!: string

  @Property()
  name!: string

  @Property({ type: "json" })
  questions!: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    score: number;
  }[];
}