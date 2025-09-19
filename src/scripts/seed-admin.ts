import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function createAdminUser(): Promise<void> {
  try {
    // Connect to database
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
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('Seeder completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}