import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    latitude: Number,
    longitude: Number,
    accuracy: {
      type: Number,
      description: 'Accuracy in meters'
    },
    altitude: Number,
    speed: Number,
    heading: Number,
    provider: {
      type: String,
      enum: ['gps', 'network', 'fused', 'manual'],
      default: 'gps'
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      formattedAddress: String
    },
    placeInfo: {
      name: String,
      type: String, // business, residence, park, etc.
      vicinity: String
    },
    metadata: {
      battery: Number,
      connectivity: String,
      source: String // 'manual', 'auto', 'sms', 'webhook'
    }
  },
  { timestamps: true }
);

// Compound index for efficient queries
locationSchema.index({ 'location': '2dsphere' });
locationSchema.index({ device: 1, createdAt: -1 });
locationSchema.index({ owner: 1, createdAt: -1 });
locationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 * parseInt(process.env.LOCATION_RETENTION_DAYS || 90) });

export default mongoose.model('Location', locationSchema);
