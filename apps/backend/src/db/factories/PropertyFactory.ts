import { faker } from "@faker-js/faker"
import { Factory } from "@mikro-orm/seeder"
import { PropertyStatus, PropertyType } from "@gdsd/common/models"
import { Property } from "@/entities/Property"

export class PropertyFactory extends Factory<Property> {
    model = Property

    // Generate random property data
    definition(): Partial<Property> {
        const availabilityFrom = faker.date.future()
        const type = faker.helpers.enumValue(PropertyType)
        const typeFormatted = type.replace(/([A-Z])/g, " $1")

        return {
            creationDate: faker.date.past(),
            reviewDate: faker.date.recent(),
            renewalDate: faker.date.future(),
            name: faker.helpers.arrayElement([
                `Cozy ${typeFormatted}`,
                `${typeFormatted} in a good neighborhood`,
                `Beautiful ${typeFormatted}`,
                `Stunning ${typeFormatted}`,
                `${typeFormatted} (good condition)`,
                `${typeFormatted} (limited availability)`
            ]),
            location: faker.helpers.arrayElement([
                "Fulda",
                "Bernhards",
                "Niesig",
                "Bronnzell",
                "Lehnerz"
            ]),
            description: faker.lorem.paragraph(),
            type,
            status: faker.helpers.enumValue(PropertyStatus),
            coldRent: faker.number.int({ min: 500, max: 5000 }),
            additionalCosts: faker.number.int({ min: 50, max: 500 }),
            deposit: faker.number.int({ min: 500, max: 10000 }),
            availabilityFrom,
            availabilityTo: faker.date.future({ refDate: availabilityFrom }),
            size: faker.number.int({ min: 20, max: 200 }),
            arePetsAllowed: faker.datatype.boolean()
        }
    }
}
