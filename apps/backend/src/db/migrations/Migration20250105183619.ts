import { Migration } from '@mikro-orm/migrations';

export class Migration20250105183619 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`tenant_questionnaire\` (\`id\` varchar(36) not null, \`creation_date\` datetime not null default CURRENT_TIMESTAMP, \`landlord_questionnaire_id\` varchar(255) not null, \`user_id\` varchar(255) not null, \`answers\` json not null, \`tenant_score\` int not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`tenant_questionnaire\`;`);
  }

}
