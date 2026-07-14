import { Migration } from '@mikro-orm/migrations';

export class Migration20250131144222 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`message\` add \`is_read_by_receiver\` tinyint(1) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`message\` drop column \`is_read_by_receiver\`;`);
  }

}
