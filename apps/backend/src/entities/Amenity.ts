import { Entity, PrimaryKey, Property } from "@mikro-orm/mysql";
import { v4 } from "uuid";

@Entity()
export class Amenity {
  @PrimaryKey({ type: "uuid" })
  id: string = v4();

  @Property()
  amenityName!: string;   // Example: "Internet", "Parking", etc.
}
