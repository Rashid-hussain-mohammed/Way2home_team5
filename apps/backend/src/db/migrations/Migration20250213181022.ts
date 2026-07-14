import { Migration } from "@mikro-orm/migrations"

export class Migration20250213181022 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`new_search_history\` add \`max_size\` int null;`)
        this.addSql(`alter table \`new_search_history\` modify \`creation_date\` datetime null, modify \`max_rent\` int null, modify \`min_rent\` int null, modify \`deposit\` int null, modify \`availability_from\` datetime null, modify \`availability_to\` datetime null;`)
        this.addSql(`alter table \`new_search_history\` modify \`type\` enum('Apartment', 'House', 'SharedApartment', 'SharedHouse') null;`)
        this.addSql(`alter table \`new_search_history\` change \`size\` \`min_size\` int null;`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`new_search_history\` drop column \`max_size\`;`)
        this.addSql(`alter table \`new_search_history\` modify \`creation_date\` datetime not null, modify \`max_rent\` int not null, modify \`min_rent\` int not null, modify \`deposit\` int not null, modify \`availability_from\` datetime not null, modify \`availability_to\` datetime not null;`)
        this.addSql(`alter table \`new_search_history\` modify \`type\` enum('Apartment', 'House', 'SharedApartment', 'SharedHouse') not null;`)
        this.addSql(`alter table \`new_search_history\` change \`min_size\` \`size\` int null;`)
    }
}
