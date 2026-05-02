const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  logo: {
    type: String
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerEmail: {
    type: String,
    required: true
  },
  ownerPassword: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tenant', tenantSchema);