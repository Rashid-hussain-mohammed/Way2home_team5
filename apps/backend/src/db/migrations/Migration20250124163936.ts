import { Migration } from '@mikro-orm/migrations';

export class Migration20250124163936 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`search_history\` (\`id\` varchar(36) not null, \`user_id\` varchar(36) not null, \`query\` varchar(255) not null, \`location\` varchar(255) null, \`type\` varchar(255) null, \`status\` varchar(255) null, \`max_rent\` int null, \`timestamp\` datetime not null default CURRENT_TIMESTAMP, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`search_history\` add index \`search_history_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`search_history\` add constraint \`search_history_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`search_history\`;`);
  }

}
