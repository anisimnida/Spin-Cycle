import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
    const user1 = await prisma.users.create({
        data: {
          name: 'pistachio',
          email: 'pistachio@gmail.com',
          password:'$2a$10$Atm8d8oOugprEH7.Q3UKW.bJ0pl7XiUPcbRztopVnW0v096R3pK6.'
         
        },
    });

    const user2 = await prisma.users.create({
        data: {
            name: 'gingerbread',
            email: 'gingerbread@gmail.com',
            password:'$2a$10$Atm8d8oOugprEH7.Q3UKW.bJ0pl7XiUPcbRztopVnW0v096R3pK6.'
           
          },
    });
}

seed().catch((e) => {
    throw e;
  }).finally(async () => {
    await prisma.$disconnect();
  });
