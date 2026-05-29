import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^\+?1?\d{9,15}$/
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      select: false
    },
    resetToken: {
      type: String,
      select: false
    },
    resetTokenExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    preferences: {
      notificationsEnabled: { type: Boolean, default: true },
      smsAlertsEnabled: { type: Boolean, default: true },
      emailAlertsEnabled: { type: Boolean, default: true },
      timezone: { type: String, default: 'UTC' }
    },
    trackedDevices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    }]
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcryptjs.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '10'));
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcryptjs.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > new Date();
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
  const lockTime = parseInt(process.env.LOCK_TIME_MINUTES || '15') * 60 * 1000;

  this.loginAttempts += 1;

  if (this.loginAttempts >= maxAttempts && !this.isAccountLocked()) {
    this.lockUntil = new Date(Date.now() + lockTime);
  }

  return this.save();
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  return this.save();
};

export default mongoose.model('User', userSchema);
