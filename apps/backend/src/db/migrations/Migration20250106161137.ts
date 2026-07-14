import { Migration } from '@mikro-orm/migrations';

export class Migration20250106161137 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`tenant_questionnaire\` add \`property_id\` varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`tenant_questionnaire\` drop column \`property_id\`;`);
  }

}
