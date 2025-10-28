const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

const email = process.argv[2] || 'joshuambiyu002@gmail.com';

async function main() {
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      console.log('No existing user with email, creating one with role ADMIN:', email);
      const created = await db.user.create({ data: { email, name: null, image: null, role: 'ADMIN' } });
      console.log('Created user with ADMIN role:', created.email, 'id:', created.id);
    } else {
      const updated = await db.user.update({ where: { email }, data: { role: 'ADMIN' } });
      console.log('User role updated to ADMIN for', updated.email, 'id:', updated.id);
    }
  } catch (err) {
    console.error('Error updating user role:', err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
