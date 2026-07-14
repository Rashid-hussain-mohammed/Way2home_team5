import { EntityManager } from "@mikro-orm/core"
import { Seeder } from "@mikro-orm/seeder"
import { PropertyStatus, PropertyType, Role, Gender } from "@gdsd/common/models"
import { PropertyFactory, UserFactory } from "@/db/factories"
import { Property, User } from "@/entities"
import { faker } from "@faker-js/faker"
import { v4 as uuidv4 } from "uuid"
import { ensureDatabase, ensureDatabaseIsUpdated } from ".."


export class DatabaseSeeder extends Seeder {
    private createUseCaseData(em: EntityManager) {
        const userRepo = em.getRepository(User)
        const propertyRepo = em.getRepository(Property)

        userRepo.create({
            id: uuidv4(),
            firstName: "Emily",
            lastName: "Li",
            email: "emily.li@example.com",
            password: "password123",
            gender: Gender.Female,
            birthDate: new Date("1995-05-10"),
            phone: "123-456-7890",
            creationDate: new Date(),
            role: Role.Student
        })

        const landlord = userRepo.create({
            id: uuidv4(),
            firstName: "Linda",
            lastName: "Weber",
            email: "linda.weber@example.com",
            password: "password123",
            gender: Gender.Female,
            birthDate: new Date("1980-08-15"),
            phone: "987-654-3210",
            creationDate: new Date(),
            role: Role.Landlord
        })

        const moderator = userRepo.create({
            id: uuidv4(),
            firstName: "Julia",
            lastName: "Braun",
            email: "julia.braun@example.com",
            password: "password123",
            gender: Gender.Female,
            birthDate: new Date("1990-07-25"),
            phone: "111-222-3333",
            creationDate: new Date(),
            role: Role.Moderator
        })

        const admin = userRepo.create({
            id: uuidv4(),
            firstName: "Alex",
            lastName: "Jansen",
            email: "alex.jansen@example.com",
            password: "password123",
            gender: Gender.Male,
            birthDate: new Date("1985-03-12"),
            phone: "444-555-6666",
            creationDate: new Date(),
            role: Role.Admin
        })

        propertyRepo.create({
            landlord: landlord.id,
            name: "Modern Apartment",
            description: "A cozy 2-bedroom apartment",
            coldRent: 1200,
            additionalCosts: 200,
            deposit: 2400,
            availabilityFrom: "2024-12-01",
            availabilityTo: "2025-06-01",
            creationDate: "2024-11-29",
            location: "Leipziger Straße",
            size: 60,
            type: PropertyType.Apartment,
            status: PropertyStatus.Pending,
            arePetsAllowed: true,
            amenitiesValues: []
        })
        propertyRepo.create({
            landlord: landlord.id,
            name: "Spacious House",
            description: "A beautiful 3-bedroom house with a garden",
            coldRent: 2500,
            additionalCosts: 300,
            deposit: 3000,
            availabilityFrom: "2024-12-01",
            availabilityTo: "2025-06-01",
            creationDate: "2024-11-01",
            location: "Wörthstraße",
            size: 120,
            type: PropertyType.House,
            status: PropertyStatus.Approved,
            reviewDate: "2024-11-20",
            arePetsAllowed: false,
            amenitiesValues: []
        })
        propertyRepo.create({
            landlord: landlord.id,
            name: "Shared Apartment",
            description: "A shared apartment with great amenities",
            coldRent: 350,
            additionalCosts: 50,
            deposit: 1500,
            availabilityFrom: "2024-12-01",
            availabilityTo: "2025-06-01",
            creationDate: "2024-11-01",
            location: "Künzell",
            size: 45,
            type: PropertyType.SharedApartment,
            status: PropertyStatus.Approved,
            reviewDate: "2024-11-20",
            arePetsAllowed: false,
            amenitiesValues: []
        })
        propertyRepo.create({
            landlord: landlord.id,
            name: "Shared Apartment",
            description: "A shared apartment in Fulda with comfortable amenities",
            coldRent: 400,
            additionalCosts: 60,
            deposit: 1600,
            availabilityFrom: "2024-12-01",
            availabilityTo: "2025-06-01",
            creationDate: "2024-11-01",
            location: "Fulda",
            size: 50,
            type: PropertyType.SharedApartment,
            status: PropertyStatus.Approved,
            reviewDate: "2024-11-20",
            arePetsAllowed: false,
            amenitiesValues: []
        })
    }

    async run(em: EntityManager): Promise<void> {
        await ensureDatabase(em)
        await ensureDatabaseIsUpdated(em)

        const userFactory = new UserFactory(em)
        const propertyFactory = new PropertyFactory(em)

        const users = userFactory.make(20)

        // create example users and properties
        this.createUseCaseData(em)

        // create random amount of properties per landlord user
        for (const user of users.filter(e => e.role == Role.Landlord)) {
            propertyFactory.create(faker.number.int({ min: 1, max: 3 }), {
                landlord: user
            })
        }

        // persist data
        await em.flush()
    }
}
