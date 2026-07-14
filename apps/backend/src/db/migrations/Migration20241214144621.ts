import { Migration } from '@mikro-orm/migrations';

export class Migration20241214144621 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`favorite_property\` (\`id\` varchar(36) not null, \`creation_date\` datetime not null, \`student_id\` varchar(36) not null, \`property_id\` varchar(36) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`favorite_property\` add index \`favorite_property_student_id_index\`(\`student_id\`);`);
    this.addSql(`alter table \`favorite_property\` add index \`favorite_property_property_id_index\`(\`property_id\`);`);

    this.addSql(`alter table \`favorite_property\` add constraint \`favorite_property_student_id_foreign\` foreign key (\`student_id\`) references \`user\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`favorite_property\` add constraint \`favorite_property_property_id_foreign\` foreign key (\`property_id\`) references \`property\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`favorite_property\`;`);
  }

}
