import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/mysql";
import { v4 } from "uuid";
import type { ITenantQuestionnaire } from "@gdsd/common/models";

@Entity()
export class TenantQuestionnaire implements ITenantQuestionnaire {
  @PrimaryKey({ type: "uuid" })
  id: string = v4();

  @Property({ type: "datetime", defaultRaw: "CURRENT_TIMESTAMP" })
  creationDate: Date = new Date();

  @Property()
  landlordQuestionnaireId!: string

  @Property()
  propertyId!: string

  @Property()
  userId!: string;

  @Property({ type: "json" })
  answers!: number[]; // Array of selected indexes for each question in the landlord's questionnaire

  @Property()
  tenantScore!: number; // Calculated score based on the tenant's answers
}
