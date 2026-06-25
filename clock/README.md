# 🕐 Digital Clock - Multiple Time Zones

A beautiful, interactive digital clock application that displays the current time across multiple time zones with both digital and analog clock displays.

## Features

✨ **Core Features**
- 🌍 View time in multiple time zones simultaneously
- 🕐 Digital time display (24-hour and 12-hour formats)
- 🔄 Analog clock with hour, minute, and second hands
- ⏱️ Real-time updates every second
- 🔍 Search and add any time zone
- ❌ Remove time zones with one click

🎨 **UI Features**
- Beautiful gradient design with smooth animations
- Responsive layout (desktop, tablet, mobile)
- Dark mode friendly
- Customizable display options
- Quick preset buttons for popular regions

🔧 **Customization Options**
- Toggle 24-hour / 12-hour format
- Show/hide seconds
- Quick preset regions (Global, USA, Europe, Asia, Oceania)

## Supported Time Zones

The clock supports 50+ time zones across all major regions:

### Americas
- New York (EST/EDT)
- Chicago (CST/CDT)
- Denver (MST/MDT)
- Los Angeles (PST/PDT)
- Toronto, Mexico City, São Paulo, Buenos Aires

### Europe
- London (GMT/BST)
- Paris, Berlin, Madrid (CET/CEST)
- Amsterdam, Rome, Vienna, Prague
- Warsaw, Istanbul, Moscow (EET/EEST)

### Africa
- Cairo, Johannesburg, Lagos, Nairobi

### Asia
- Dubai, Kolkata, Bangkok
- Hong Kong, Shanghai, Tokyo
- Seoul, Singapore

### Oceania
- Sydney, Melbourne, Brisbane
- Auckland, Fiji

## How to Use

### 1. **Open the Application**
Open `index.html` in your web browser.

### 2. **Add Time Zones**
- **Search Method**: Type a city or timezone name in the search box and click "Add Time Zone"
  - Examples: "New York", "Tokyo", "London", "Sydney"
- **Preset Method**: Click any preset button (Global, USA, Europe, Asia, Oceania)

### 3. **Customize Display**
- Check/uncheck "24-Hour Format" to toggle between 24 and 12-hour formats
- Check/uncheck "Show Seconds" to show/hide seconds in the display

### 4. **Remove Time Zones**
Click the "×" button on any clock card to remove it

### 5. **View Information**
Each clock card displays:
- Digital time (HH:MM:SS format)
- Analog clock visualization
- Current date
- UTC offset

## Default Time Zones

The clock starts with three default time zones:
1. **New York** (America/New_York) - Eastern Time
2. **London** (Europe/London) - GMT/BST
3. **Tokyo** (Asia/Tokyo) - JST

## Quick Presets

### Global
- New York, London, Tokyo

### USA
- New York, Chicago, Denver, Los Angeles

### Europe
- London, Paris, Berlin, Moscow

### Asia
- Tokyo, Shanghai, Hong Kong, Bangkok

### Oceania
- Sydney, Melbourne, Auckland

## File Structure

```
clock/
├── index.html      # Main HTML file
├── styles.css      # Styling and animations
├── clock.js        # Core clock logic
└── README.md       # Documentation
```

## Technical Details

### JavaScript Class: `DigitalClock`

**Key Methods:**
- `addClock(timezone)` - Add a new time zone
- `removeClock(timezone)` - Remove a time zone
- `updateAllClocks()` - Update all clock displays
- `formatTime(date, format24h, showSeconds)` - Format time display
- `getTimeInTimezone(date, timezone)` - Get time for specific timezone
- `getTimezoneOffset(timezone)` - Get UTC offset

### Time Calculation

The clock uses the browser's `toLocaleString()` with `timeZone` option to calculate accurate time for each timezone, automatically handling:
- Daylight Saving Time (DST)
- Timezone offsets
- Date boundaries

## Browser Compatibility

✅ Chrome 58+
✅ Firefox 55+
✅ Safari 12+
✅ Edge 79+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized for smooth updates at 1 Hz (1 update per second)
- Minimal DOM manipulation
- Efficient CSS animations
- Responsive grid layout

## Keyboard Shortcuts

- **Enter** - Add time zone after typing in search box
- **Click X** - Remove time zone

## Customization Guide

### Add New Default Time Zones

Edit `clock.js` line with `defaultTimezones`:

```javascript
this.defaultTimezones = [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'  // Add new timezone
];
```

### Add New Preset

Edit `index.html` in the presets section:

```html
<button class="preset-btn" data-zones='["America/New_York", "Europe/London"]'>
    My Preset
</button>
```

### Change Color Scheme

Edit `styles.css` and modify gradient colors:

```css
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

## API Reference

### DigitalClock Class

```javascript
// Initialize
const clock = new DigitalClock();

// Add time zone
clock.addClock('America/Los_Angeles');

// Remove time zone
clock.removeClock('America/Los_Angeles');

// Load preset
clock.loadPreset(['America/New_York', 'Europe/London']);

// Stop updates
clock.stopUpdating();

// Restart updates
clock.startUpdating();
```

## Tips & Tricks

1. **Favorite Time Zones**: Save your frequently used time zones by making a custom preset
2. **Fullscreen Mode**: Press F11 for a fullscreen clock display
3. **Multiple Windows**: Open multiple instances for different preset groups
4. **Share Time**: Use the digital display to share current time across timezones

## Troubleshooting

### Clock shows wrong time
- Ensure your device time is accurate
- Check that the timezone name is spelled correctly
- Try searching without underscore (e.g., "New York" instead of "New_York")

### Some timezones not working
- Not all IANA timezone identifiers are supported in all browsers
- Use the provided list of supported timezones
- Alternative: Search by city name

## License

MIT License - Free to use and modify

## Contributing

Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share your custom presets

## Future Enhancements

- 📍 Add geolocation-based timezone detection
- 📱 Mobile app version
- 🔔 Alarm functionality
- 📊 Time zone comparison view
- 🎨 Theme customization
- 💾 Save custom presets
- 🌙 Dark mode toggle
- 🔊 Audio tick sound

---

Enjoy your global time zone companion! 🌍⏰
