const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    // Customers sign in with email; admins sign in with username instead.
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      required: [function isCustomer() { return this.role !== 'admin' }, 'Email is required'],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      required: [function isAdmin() { return this.role === 'admin' }, 'Username is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    // One-time recovery code hash, shown once (at admin signup or after a
    // reset) and used to reset a forgotten admin password. There's no email
    // service wired up, so this is the only recovery path.
    recoveryCodeHash: {
      type: String,
      select: false,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  { timestamps: true }
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.matchRecoveryCode = function matchRecoveryCode(candidate) {
  if (!this.recoveryCodeHash) return Promise.resolve(false)
  return bcrypt.compare(candidate, this.recoveryCodeHash)
}

module.exports = mongoose.model('User', userSchema)
