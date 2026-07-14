import { Migration } from '@mikro-orm/migrations';

export class Migration20250112232338 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`message\` add \`property_id\` varchar(36) not null;`);
    this.addSql(`alter table \`message\` add constraint \`message_property_id_foreign\` foreign key (\`property_id\`) references \`property\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`message\` add index \`message_property_id_index\`(\`property_id\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`message\` drop foreign key \`message_property_id_foreign\`;`);

    this.addSql(`alter table \`message\` drop index \`message_property_id_index\`;`);
    this.addSql(`alter table \`message\` drop column \`property_id\`;`);
  }

}
