import { Migration } from '@mikro-orm/migrations';

export class Migration20250204124725 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`new_search_history\` (\`id\` varchar(36) not null, \`creation_date\` datetime not null, \`user_id\` varchar(36) not null, \`query\` varchar(255) not null, \`location\` varchar(255) not null, \`description\` varchar(255) null, \`type\` enum('Apartment', 'House', 'SharedApartment', 'SharedHouse') not null, \`status\` enum('Pending', 'Approved', 'Rejected') not null default 'Pending', \`max_rent\` int not null, \`min_rent\` int not null, \`deposit\` int not null, \`availability_from\` datetime not null, \`availability_to\` datetime not null, \`size\` int null, \`are_pets_allowed\` tinyint(1) null, \`search_preferences_id\` varchar(255) null, \`amenities_values\` json null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`new_search_history\` add index \`new_search_history_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`new_search_history\` add constraint \`new_search_history_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`new_search_history\`;`);
  }

}
