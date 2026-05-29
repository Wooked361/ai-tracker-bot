import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'web', 'wearable', 'iot'],
      required: true
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web', 'windows', 'macos', 'linux'],
      required: true
    },
    osVersion: String,
    appVersion: String,
    isActive: {
      type: Boolean,
      default: true
    },
    isTracking: {
      type: Boolean,
      default: false
    },
    lastLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      accuracy: Number,
      timestamp: Date
    },
    lastSeen: Date,
    battery: {
      level: Number,
      isCharging: Boolean
    },
    connectivity: {
      type: String,
      enum: ['wifi', 'cellular', 'offline', 'unknown'],
      default: 'unknown'
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true
    },
    locationHistory: [{
      coordinates: [Number],
      accuracy: Number,
      provider: String,
      timestamp: Date
    }],
    geofences: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Geofence'
    }],
    settings: {
      updateInterval: { type: Number, default: 300000 }, // 5 minutes
      accuracyThreshold: { type: Number, default: 50 },
      enableAlerts: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

// Index for geospatial queries
deviceSchema.index({ 'lastLocation': '2dsphere' });
deviceSchema.index({ owner: 1 });
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ isActive: 1, isTracking: 1 });

export default mongoose.model('Device', deviceSchema);
