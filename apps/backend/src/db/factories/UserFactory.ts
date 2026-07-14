import { faker, type SexType } from "@faker-js/faker"
import { Factory } from "@mikro-orm/seeder"
import { Gender, Role } from "@gdsd/common/models"
import { User } from "@/entities/User"

export class UserFactory extends Factory<User> {
    model = User

    // Generate random user data
    definition(): Partial<User> {
        const gender = faker.helpers.enumValue(Gender)
        let sex: SexType | undefined = undefined

        if (gender == Gender.Female)
            sex = "female"
        if (gender == Gender.Male)
            sex = "male"

        return {
            firstName: faker.person.firstName(sex),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            gender,
            birthDate: faker.date.birthdate(),
            phone: faker.phone.number(),
            role: faker.helpers.enumValue(Role)
        }
    }
}
