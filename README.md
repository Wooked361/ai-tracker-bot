# AI Tracker Bot

An intelligent location tracking bot that receives SMS commands and tracks device locations in real-time across any device type.

## Features

- 📱 **Multi-Device Support**: Track locations from iOS, Android, web, and any device with internet
- 💬 **SMS Commands**: Control tracking via simple SMS commands
- 🤖 **AI-Powered Analysis**: Location predictions, pattern recognition, and anomaly detection
- 🗺️ **Real-Time Dashboard**: Live tracking map and location history
- 🔐 **Secure**: End-to-end encryption and authentication
- 📊 **Analytics**: Location history, movement patterns, and detailed reports
- 🚀 **Scalable**: Built with Node.js, MongoDB, and cloud-ready deployment

## Quick Start

### Prerequisites

- Node.js v16+
- MongoDB
- Twilio account (for SMS)
- Google Maps API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Wooked361/ai-tracker-bot.git
cd ai-tracker-bot

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your API keys and credentials

# Run development server
npm run dev

# Run production server
npm start
```

## Configuration

### Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ai-tracker-bot

# Twilio SMS
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Google Maps
GOOGLE_MAPS_API_KEY=your_api_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Location Tracking
- `POST /api/locations/submit` - Submit device location
- `GET /api/locations` - Get all tracked locations
- `GET /api/locations/:id` - Get specific location
- `GET /api/locations/device/:deviceId` - Get device location history

### SMS Commands
- `POST /api/sms/webhook` - Twilio webhook for incoming SMS
- `POST /api/sms/send` - Send SMS command

### Devices
- `GET /api/devices` - List all tracked devices
- `POST /api/devices` - Register new device
- `DELETE /api/devices/:id` - Unregister device

### Analytics
- `GET /api/analytics/summary` - Location summary
- `GET /api/analytics/patterns` - Movement patterns
- `GET /api/analytics/predictions` - AI predictions

## SMS Commands

```
TRACK              - Enable tracking for this device
STOP               - Stop tracking
LOCATION           - Get current location
HISTORY            - Get location history
STATUS             - Get tracking status
LIST               - List all tracked devices
ALERT on|off       - Enable/disable alerts
```

## Usage Examples

### Via SMS
```
Send SMS to your Twilio number:
"TRACK"            -> Activates tracking
"LOCATION"         -> Returns current GPS location
"HISTORY 7"        -> Returns last 7 days of locations
```

### Via API
```bash
# Submit location from device
curl -X POST http://localhost:3000/api/locations/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device123",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10,
    "provider": "gps"
  }'

# Get current locations
curl http://localhost:3000/api/locations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Project Structure

```
ai-tracker-bot/
├── server/
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth, validation
│   ├── services/         # SMS, Location, AI services
│   ├── utils/           # Utilities
│   └── app.js           # Express app setup
├── client/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Pages
│   │   ├── services/    # API services
│   │   └── App.js       # Main component
│   └── package.json
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Deployment

### Docker
```bash
# Build image
docker build -t ai-tracker-bot .

# Run container
docker run -p 3000:3000 --env-file .env ai-tracker-bot
```

### Docker Compose
```bash
docker-compose up -d
```

### Cloud Deployment
- AWS: See `deployment/aws.md`
- Google Cloud: See `deployment/gcp.md`
- Heroku: See `deployment/heroku.md`

## Security Considerations

- All API endpoints require JWT authentication
- SMS commands are validated and rate-limited
- Location data is encrypted at rest
- HTTPS/TLS for all external communications
- Regular security audits recommended

## AI Features

- **Location Predictions**: ML model predicts next likely location
- **Pattern Recognition**: Identifies recurring routes and places
- **Anomaly Detection**: Alerts on unusual movement
- **Risk Assessment**: Scores location safety and risk

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/Wooked361/ai-tracker-bot/issues
- Email: support@example.com

## Roadmap

- [ ] Real-time WebSocket updates
- [ ] Advanced geofencing
- [ ] Integration with third-party services
- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Machine learning model improvements
