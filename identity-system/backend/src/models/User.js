import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    // Profile information
    avatar: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    
    // Security features
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Two-factor authentication
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    twoFactorBackupCodes: [String],
    
    // Biometric authentication
    biometricEnabled: { type: Boolean, default: false },
    biometricCredentials: [{
      id: String,
      publicKey: String,
      counter: { type: Number, default: 0 },
      deviceType: String,
      backedUp: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],
    
    // Security settings
    lastLogin: Date,
    lastLoginIP: String,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    
    // Preferences
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
      language: { type: String, default: 'en' }
    },
    
    // Activity tracking
    isActive: { type: Boolean, default: true },
    lastActivity: Date
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    // Only hash if it's not already hashed (check if it starts with $2a$ or $2b$)
    if (!this.passwordHash.startsWith('$2a$') && !this.passwordHash.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.checkPassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

export const User = mongoose.model('User', userSchema);
export default User;

