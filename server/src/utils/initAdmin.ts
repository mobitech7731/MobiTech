import { Admin } from '../models/Admin.js';
import { authService } from '../services/auth.service.js';
import { hashPassword } from '../utils/password.js';

export async function initAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) return;

  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      const newHash = await hashPassword(password);
      await Admin.updateOne({ email }, { passwordHash: newHash, name });
      console.log('Admin updated:', email);
    } else {
      try {
        await authService.createAdmin(email, password, name);
        console.log('Admin created:', email);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
          console.log('Admin already exists (duplicate key):', email);
          const newHash = await hashPassword(password);
          await Admin.updateOne({ email }, { passwordHash: newHash, name });
          console.log('Admin updated instead:', email);
        } else {
          throw err;
        }
      }
    }
  } catch (err) {
    console.error('Failed to init admin:', err);
  }
}
