import { Migration } from '@mikro-orm/migrations';

export class Migration20241212201912 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`amenity\` (\`id\` varchar(36) not null, \`amenity_name\` varchar(255) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`landlord_questionnaire\` (\`id\` varchar(36) not null, \`creation_date\` datetime not null default CURRENT_TIMESTAMP, \`landlord_id\` varchar(255) not null, \`questions\` json not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`user\` (\`id\` varchar(36) not null, \`first_name\` varchar(255) not null, \`last_name\` varchar(255) not null, \`role\` enum('Landlord', 'Student', 'Moderator', 'Admin') not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`property\` (\`id\` varchar(36) not null, \`creation_date\` datetime not null, \`renewal_date\` datetime not null, \`review_date\` datetime null, \`landlord_id\` varchar(36) not null, \`name\` varchar(255) not null, \`location\` varchar(255) not null, \`description\` varchar(255) null, \`type\` enum('Apartment', 'House', 'SharedApartment', 'SharedHouse') not null, \`status\` enum('Pending', 'Approved', 'Rejected') not null default 'Pending', \`cold_rent\` int not null, \`additional_costs\` int not null, \`warm_rent\` int generated always as (cold_rent + additional_costs) stored, \`deposit\` int not null, \`availability_from\` datetime not null, \`availability_to\` datetime not null, \`size\` int null, \`are_pets_allowed\` tinyint(1) null, \`landlord_questionnaire_id\` varchar(36) null, \`amenities_values\` json null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`property\` add index \`property_landlord_id_index\`(\`landlord_id\`);`);

    this.addSql(`create table \`media_file\` (\`id\` varchar(36) not null, \`creation_date\` datetime not null, \`type\` tinyint not null, \`property_id\` varchar(36) null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`media_file\` add index \`media_file_property_id_index\`(\`property_id\`);`);

    this.addSql(`alter table \`property\` add constraint \`property_landlord_id_foreign\` foreign key (\`landlord_id\`) references \`user\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`media_file\` add constraint \`media_file_property_id_foreign\` foreign key (\`property_id\`) references \`property\` (\`id\`) on update cascade on delete set null;`);
  }

}
