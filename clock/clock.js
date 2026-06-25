class DigitalClock {
    constructor() {
        this.clocks = [];
        this.defaultTimezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
        this.updateInterval = null;
        this.allTimezones = this.getAllTimezones();
        
        this.init();
    }

    init() {
        // Initialize with default time zones
        this.defaultTimezones.forEach(tz => this.addClock(tz));
        
        // Set up event listeners
        document.getElementById('addTimezoneBtn').addEventListener('click', () => this.handleAddTimezone());
        document.getElementById('timezoneSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddTimezone();
        });
        document.getElementById('format24h').addEventListener('change', () => this.updateAllClocks());
        document.getElementById('showSeconds').addEventListener('change', () => this.updateAllClocks());
        
        // Add preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadPreset(JSON.parse(e.target.dataset.zones)));
        });
        
        // Start updating clocks
        this.startUpdating();
    }

    getAllTimezones() {
        return [
            // Americas
            'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
            'America/Anchorage', 'Pacific/Honolulu', 'America/Toronto', 'America/Mexico_City',
            'America/Sao_Paulo', 'America/Buenos_Aires',
            
            // Europe
            'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
            'Europe/Amsterdam', 'Europe/Rome', 'Europe/Vienna', 'Europe/Prague',
            'Europe/Warsaw', 'Europe/Istanbul', 'Europe/Moscow',
            
            // Africa
            'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
            
            // Asia
            'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Hong_Kong',
            'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Singapore',
            
            // Oceania
            'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane',
            'Pacific/Auckland', 'Pacific/Fiji'
        ];
    }

    addClock(timezone) {
        // Check if timezone already added
        if (this.clocks.some(c => c.timezone === timezone)) {
            alert(`${timezone} is already added!`);
            return;
        }
        
        this.clocks.push({ timezone });
        this.renderClocks();
    }

    removeClock(timezone) {
        this.clocks = this.clocks.filter(c => c.timezone !== timezone);
        this.renderClocks();
    }

    handleAddTimezone() {
        const input = document.getElementById('timezoneSearch').value.trim();
        
        if (!input) {
            alert('Please enter a timezone name');
            return;
        }
        
        // Find matching timezone
        const matched = this.allTimezones.filter(tz => 
            tz.toLowerCase().includes(input.toLowerCase())
        );
        
        if (matched.length === 0) {
            alert(`No timezone found matching "${input}"`);
            return;
        }
        
        if (matched.length === 1) {
            this.addClock(matched[0]);
        } else {
            // Show selection dialog
            const selected = matched[0]; // Auto-select first match
            this.addClock(selected);
        }
        
        document.getElementById('timezoneSearch').value = '';
    }

    loadPreset(timezones) {
        this.clocks = [];
        timezones.forEach(tz => this.addClock(tz));
    }

    startUpdating() {
        this.updateAllClocks();
        this.updateInterval = setInterval(() => this.updateAllClocks(), 1000);
    }

    stopUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    updateAllClocks() {
        document.querySelectorAll('.clock-card').forEach(card => {
            const timezone = card.dataset.timezone;
            this.updateClockCard(card, timezone);
        });
    }

    updateClockCard(card, timezone) {
        const now = new Date();
        const time = this.getTimeInTimezone(now, timezone);
        
        const format24h = document.getElementById('format24h').checked;
        const showSeconds = document.getElementById('showSeconds').checked;
        
        // Update digital time
        const digitalTimeEl = card.querySelector('.digital-time');
        digitalTimeEl.textContent = this.formatTime(time, format24h, showSeconds);
        
        // Update analog clock
        this.updateAnalogClock(card, time);
        
        // Update info
        const dateStr = time.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
        const offset = this.getTimezoneOffset(timezone);
        
        card.querySelector('.date-info').textContent = dateStr;
        card.querySelector('.offset-info').textContent = offset;
    }

    getTimeInTimezone(date, timezone) {
        const utcTime = date.toLocaleString('en-US', { timeZone: 'UTC' });
        const tzTime = date.toLocaleString('en-US', { timeZone: timezone });
        
        const utcDate = new Date(utcTime);
        const tzDate = new Date(tzTime);
        
        const diff = tzDate - utcDate;
        return new Date(date.getTime() + diff);
    }

    formatTime(date, format24h = true, showSeconds = true) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        let timeString = `${hours}:${minutes}`;
        if (showSeconds) {
            timeString += `:${seconds}`;
        }
        
        if (!format24h) {
            const hour = date.getHours();
            const hour12 = hour % 12 || 12;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const minutesStr = String(date.getMinutes()).padStart(2, '0');
            const secondsStr = String(date.getSeconds()).padStart(2, '0');
            
            timeString = `${hour12}:${minutesStr}`;
            if (showSeconds) {
                timeString += `:${secondsStr}`;
            }
            timeString += ` ${ampm}`;
        }
        
        return timeString;
    }

    updateAnalogClock(card, time) {
        const hours = time.getHours() % 12;
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        
        const hourHand = card.querySelector('.hour-hand');
        const minuteHand = card.querySelector('.minute-hand');
        const secondHand = card.querySelector('.second-hand');
        
        const hourDeg = (hours * 30) + (minutes * 0.5);
        const minuteDeg = (minutes * 6) + (seconds * 0.1);
        const secondDeg = seconds * 6;
        
        hourHand.style.transform = `rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        secondHand.style.transform = `rotate(${secondDeg}deg)`;
    }

    getTimezoneOffset(timezone) {
        const now = new Date();
        const utcTime = now.toLocaleString('en-US', { timeZone: 'UTC' });
        const tzTime = now.toLocaleString('en-US', { timeZone: timezone });
        
        const utcDate = new Date(utcTime);
        const tzDate = new Date(tzTime);
        
        const diff = (tzDate - utcDate) / (1000 * 60 * 60);
        const sign = diff >= 0 ? '+' : '';
        const hours = Math.floor(Math.abs(diff));
        const minutes = Math.round((Math.abs(diff) - hours) * 60);
        
        return `UTC ${sign}${hours}:${String(minutes).padStart(2, '0')}`;
    }

    renderClocks() {
        const grid = document.getElementById('clocksGrid');
        
        if (this.clocks.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">🕐</div>
                    <div>No time zones added yet</div>
                    <div style="font-size: 0.9em; margin-top: 10px;">Search and add a time zone to get started</div>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.clocks.map(clock => `
            <div class="clock-card" data-timezone="${clock.timezone}">
                <div class="clock-header">
                    <div>
                        <div class="timezone-name">${this.formatTimezoneName(clock.timezone)}</div>
                        <div class="timezone-offset offset-info"></div>
                    </div>
                    <button class="remove-btn" onclick="window.clock.removeClock('${clock.timezone}')">×</button>
                </div>
                
                <div class="digital-time">--:--:--</div>
                
                <div class="analog-clock">
                    <div class="clock-numbers">
                        ${this.createClockNumbers()}
                    </div>
                    <div class="hand hour-hand"></div>
                    <div class="hand minute-hand"></div>
                    <div class="hand second-hand"></div>
                    <div class="clock-center"></div>
                </div>
                
                <div class="clock-info">
                    <div class="info-row">
                        <span class="info-label">Date:</span>
                        <span class="date-info">--</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Update all clocks
        this.updateAllClocks();
    }

    createClockNumbers() {
        let html = '';
        for (let i = 1; i <= 12; i++) {
            const angle = (i - 3) * 30;
            const x = 50 + 35 * Math.cos(angle * Math.PI / 180);
            const y = 50 + 35 * Math.sin(angle * Math.PI / 180);
            html += `<div class="number" style="transform: translate(${x}%, ${y}%); left: -50%; top: -50%;">${i}</div>`;
        }
        return html;
    }

    formatTimezoneName(timezone) {
        return timezone.replace(/_/g, ' ').split('/')[1] || timezone;
    }
}

// Initialize clock when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.clock = new DigitalClock();
    });
} else {
    window.clock = new DigitalClock();
}
