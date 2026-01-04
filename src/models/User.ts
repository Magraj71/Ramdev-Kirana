import mongoose, { Schema, models, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Interface for TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  storeName?: string;
  storeType: 'kirana' | 'supermarket' | 'convenience' | 'specialty' | 'other';
  gstNumber?: string;
  role: 'user' | 'owner';
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  
  // Password security fields
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  lastLoginAt?: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    phone: { 
      type: String,
      trim: true,
    },
    address: { 
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    storeName: { 
      type: String,
      trim: true,
      maxlength: [100, 'Store name cannot exceed 100 characters']
    },
    storeType: { 
      type: String,
      enum: ['kirana', 'supermarket', 'convenience', 'specialty', 'other'],
      default: 'kirana'
    },
    gstNumber: { 
      type: String,
      trim: true,
      uppercase: true,
    },
    role: { 
      type: String, 
      enum: ['user', 'owner'],
      default: "user" 
    },
    avatar: { 
      type: String,
      default: ''
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Password security fields
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    
    // Account security
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    
    // Additional fields for analytics
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    loyaltyPoints: {
      type: Number,
      default: 0
    },
    
    // Preferences
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      },
      language: {
        type: String,
        default: 'en'
      }
    }
  },
  { 
    timestamps: true,
  }
);

// SIMPLIFIED PRE-SAVE MIDDLEWARE - REMOVE THE NEXT() FUNCTION
UserSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Set password changed timestamp
    this.passwordChangedAt = new Date();
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

// Method to create password reset token
UserSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Export the model
const User = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;