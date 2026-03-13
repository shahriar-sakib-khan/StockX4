import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { User, IUser } from '../user/user.model';
import { RefreshToken } from './refreshToken.model';
import { StaffModel } from '../staff/staff.model';
import { StoreModel } from '../store/store.model';

const _jwtSecret = process.env.JWT_SECRET;
if (!_jwtSecret) throw new Error('FATAL: JWT_SECRET environment variable is required');
const JWT_SECRET: string = _jwtSecret;

const _refreshSecret = process.env.REFRESH_SECRET;
if (!_refreshSecret) throw new Error('FATAL: REFRESH_SECRET environment variable is required');
const REFRESH_SECRET: string = _refreshSecret;

export class AuthService {
  static async register(email: string, password: string, name: string, phone?: string): Promise<IUser> {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone?.trim();

    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Lower memory cost (16MB) to prevent OOM on Render Free tier
    const hashedPassword = await argon2.hash(password, { memoryCost: 2 ** 14, timeCost: 2 });

    const user = await User.create({
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      name,
    });

    return user;
  }


  static async login(identifier: string, password: string) {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    // 1. Find potential identities
    const user = await User.findOne({ $or: [{ email: normalizedIdentifier }, { phone: normalizedIdentifier }] });
    const staffMembers = await StaffModel.find({ contact: normalizedIdentifier }).populate('storeId');

    if (!user && staffMembers.length === 0) {
      throw new Error('Invalid credentials');
    }

    // 2. Validate Password (Try User first, then Staff)
    let validIdentity: any = null;
    let type: 'user' | 'staff' = 'user';

    try {
      if (user) {
        const isValid = await argon2.verify(user.password!, password);
        if (isValid) {
          validIdentity = user;
          type = 'user';
        }
      }

      if (!validIdentity && staffMembers.length > 0) {
        // Check the first staff member (passwords should be sync'd if they are the same person,
        // but in this model they are separate hashes. We check if the password matches ANY of the staff records with this contact)
        for (const staff of staffMembers) {
          if (!staff.passwordHash) continue;
          const isValid = await argon2.verify(staff.passwordHash, password);
          if (isValid) {
            validIdentity = staff;
            type = 'staff';
            break;
          }
        }
      }
    } catch (e: any) {
      throw new Error('Hash verification failed: ' + e.message);
    }

    if (!validIdentity) {
      throw new Error('Invalid credentials');
    }

    // 3. Handle Result
    if (type === 'user') {
      const stores = await StoreModel.find({ ownerId: validIdentity._id });
      if (stores.length === 1) {
        return {
          ...(await this.generateTokens(validIdentity)),
          redirect: `/stores/${stores[0]._id}/dashboard`,
          selectionRequired: false
        };
      } else if (stores.length > 1) {
        return {
          ...(await this.generateTokens(validIdentity)),
          redirect: '/stores',
          selectionRequired: true,
          stores: stores.map(s => ({ id: s._id, name: s.name, slug: s.slug }))
        };
      } else {
        return {
          ...(await this.generateTokens(validIdentity)),
          redirect: '/setup',
          selectionRequired: false
        };
      }
    } else {
      // It's a staff member
      // If associated with multiple stores as staff, we need to handle that.
      // For now, if multiple staff records with same contact/password, we might need a selection.
      // BUT the user said phone is unique and association is rare.

      const matchingStaff = [];
      for(const s of staffMembers) {
          if (s.passwordHash && await argon2.verify(s.passwordHash, password)) {
              matchingStaff.push(s);
          }
      }

      if (matchingStaff.length === 1) {
          const staff = matchingStaff[0];
          const token = jwt.sign(
            { userId: staff._id, role: staff.role, storeId: (staff.storeId as any)._id, type: 'staff', name: staff.name },
            JWT_SECRET,
            { expiresIn: '12h' }
          );
          return {
            accessToken: token,
            user: {
                id: staff._id,
                name: staff.name,
                role: staff.role,
                storeId: (staff.storeId as any)._id
            },
            redirect: staff.role === 'manager' ? `/stores/${(staff.storeId as any)._id}` : '/pos',
            selectionRequired: false
          };
      } else {
          // Multiple staff associations
          return {
              selectionRequired: true,
              type: 'staff_selection',
              options: matchingStaff.map(s => ({
                  staffId: s._id,
                  storeId: (s.storeId as any)._id,
                  storeName: (s.storeId as any).name,
                  role: s.role
              }))
          };
      }
    }
  }

  static async googleLogin(idToken: string) {
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error('Invalid Google Token');
    
    const normalizedEmail = payload.email.trim().toLowerCase();
    const { name, picture } = payload;
    
    let user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
            email: normalizedEmail,
            name,
            avatar: picture,
            role: 'user', // Default role
            // No password for social logins, or generate a random one
        });
    }

    // Reuse unified login logic for store redirection
    // Since we only have the User object here (not Staff for now for Google)
    const stores = await StoreModel.find({ ownerId: user._id });
    const tokens = await this.generateTokens(user);

    if (stores.length === 1) {
        return {
            ...tokens,
            redirect: `/stores/${stores[0]._id}/dashboard`,
            selectionRequired: false
        };
    } else if (stores.length > 1) {
        return {
            ...tokens,
            redirect: '/stores',
            selectionRequired: true,
            stores: stores.map(s => ({ id: s._id, name: s.name, slug: s.slug }))
        };
    } else {
        return {
            ...tokens,
            redirect: '/setup',
            selectionRequired: false
        };
    }
  }

  static async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { userId: string };
      const tokenDoc = await RefreshToken.findOne({ userId: payload.userId, token: refreshToken });

      if (!tokenDoc) {
        throw new Error('Invalid refresh token');
      }

      // Rotate: Delete old, create new
      await RefreshToken.deleteOne({ _id: tokenDoc._id });

      const user = await User.findById(payload.userId);
      if (!user) throw new Error('User not found');

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async logout(refreshToken: string) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  private static async generateTokens(user: any) {
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    };
  }
}
