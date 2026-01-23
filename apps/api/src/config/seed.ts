import { User } from '../features/user/user.model';
import argon2 from 'argon2';

export const seedUsers = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const testEmail = 'test@gmail.com';

    // Seed Admin
    const adminPassword = await argon2.hash('admin123');
    await User.findOneAndUpdate(
      { email: adminEmail },
      {
        email: adminEmail,
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Admin User synced: ${adminEmail} (Pass: admin123)`);

    // Seed Test User
    const testPassword = await argon2.hash('test123');
    await User.findOneAndUpdate(
      { email: testEmail },
      {
        email: testEmail,
        password: testPassword,
        name: 'Test User',
        role: 'user',
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Test User synced: ${testEmail} (Pass: test123)`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};
