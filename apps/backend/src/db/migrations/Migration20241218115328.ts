import { Migration } from '@mikro-orm/migrations';

export class Migration20241218115328 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`user\` modify \`phone\` varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`user\` modify \`phone\` varchar(255) not null;`);
  }

}
