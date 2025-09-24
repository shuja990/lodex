// Using relative imports so this file can be executed directly with ts-node without path alias resolution
async function loadDeps() {
  const { connectToDatabase } = await import('../lib/mongodb');
  const userModule: { default: typeof import('../models/User').default } = await import('../models/User');
  const User = userModule.default;
  return { connectToDatabase, User };
}

export async function createAdminUser(): Promise<void> {
  try {
    const { connectToDatabase, User } = await loadDeps();
    await connectToDatabase();
    
    // Check if admin already exists
  const existingAdmin = await User.findOne({ email: 'admin@lodex.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await User.create({
      email: 'admin@lodex.com',
      password: 'admin123', // Change this password in production
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
    });

    console.log('Admin user created successfully:', {
      email: admin.email,
      role: admin.role,
      name: `${admin.firstName} ${admin.lastName}`
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Run seeder if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('Seeder completed');
    })
    .catch(() => {
      // error already logged
      process.exitCode = 1;
    });
}