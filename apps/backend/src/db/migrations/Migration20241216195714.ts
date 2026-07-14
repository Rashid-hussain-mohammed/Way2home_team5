import { Migration } from '@mikro-orm/migrations';

export class Migration20241216195714 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`user\` add \`email\` varchar(255) not null, add \`password\` varchar(255) not null, add \`gender\` enum('Female', 'Male', 'Other') not null, add \`birth_date\` datetime not null, add \`phone\` varchar(255) not null, add \`creation_date\` datetime not null, add \`avatar\` varchar(255) null, add \`about\` varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`user\` drop column \`email\`, drop column \`password\`, drop column \`gender\`, drop column \`birth_date\`, drop column \`phone\`, drop column \`creation_date\`, drop column \`avatar\`, drop column \`about\`;`);
  }

}
