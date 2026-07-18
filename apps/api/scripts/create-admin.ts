import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
};

async function main() {
  console.log('--- Create Ghosted Admin ---');
  
  const email = await question('Admin Email: ');
  if (!email) {
    console.error('Email is required.');
    process.exit(1);
  }

  const name = await question('Admin Name: ');
  if (!name) {
    console.error('Name is required.');
    process.exit(1);
  }

  const password = await question('Password (min 8 chars): ');
  if (!password || password.length < 8) {
    console.error('Password must be at least 8 characters long.');
    process.exit(1);
  }

  // Check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.error('A user with this email already exists.');
    process.exit(1);
  }

  console.log('Creating admin user...');
  const passwordHash = await bcrypt.hash(password, 10);

  // Create the user, account, role assignment in one transaction
  const user = await prisma.$transaction(async (tx) => {
    // Create the user
    const newUser = await tx.user.create({
      data: {
        email,
        name,
        emailVerified: true,
      },
    });

    // Create the credential account (for better-auth)
    await tx.account.create({
      data: {
        userId: newUser.id,
        accountId: newUser.id,
        providerId: 'credential',
        password: passwordHash,
      },
    });

    // Assign the SUPER_ADMIN role
    await tx.userRoleAssignment.create({
      data: {
        userId: newUser.id,
        role: UserRole.SUPER_ADMIN,
      },
    });

    return newUser;
  });

  console.log(`\n✅ Successfully created Super Admin: ${user.email}`);
  console.log('You can now log in at the /login page.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    rl.close();
  });
