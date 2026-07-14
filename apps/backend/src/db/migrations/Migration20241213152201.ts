import { Migration } from '@mikro-orm/migrations';

export class Migration20241213152201 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`message\` (\`id\` varchar(36) not null, \`creation_date\` datetime not null, \`content\` varchar(255) not null, \`sender_id\` varchar(36) not null, \`receiver_id\` varchar(36) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`message\` add index \`message_sender_id_index\`(\`sender_id\`);`);
    this.addSql(`alter table \`message\` add index \`message_receiver_id_index\`(\`receiver_id\`);`);

    this.addSql(`alter table \`message\` add constraint \`message_sender_id_foreign\` foreign key (\`sender_id\`) references \`user\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`message\` add constraint \`message_receiver_id_foreign\` foreign key (\`receiver_id\`) references \`user\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`message\`;`);
  }

}
