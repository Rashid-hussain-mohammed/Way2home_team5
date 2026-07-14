import { Migration } from '@mikro-orm/migrations';

export class Migration20250201144929 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`property\` add \`visits\` int null default 0;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`property\` drop column \`visits\`;`);
  }

}
