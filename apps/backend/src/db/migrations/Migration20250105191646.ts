import { Migration } from '@mikro-orm/migrations';

export class Migration20250105191646 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`landlord_questionnaire\` add \`name\` varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`landlord_questionnaire\` drop column \`name\`;`);
  }

}
