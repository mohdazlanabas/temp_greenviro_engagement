# Greenviro Farewell Website

A simple, elegant farewell website for Greenviro Sdn Bhd colleagues with a comments/wishes section.

## Project Background

This website was created as a digital farewell card for colleagues at Greenviro Sdn Bhd after 36 months of full-time engagement. It provides a platform for team members to leave their well-wishes and comments, keeping WhatsApp cleaner while preserving memories.

The site features:
- Visitor tracking (count, location, time)
- Comments/wishes submission (max 200 characters)
- Farewell message display
- Partner organization links (Malaysia, Jakarta, Bali)
- All submitted messages displayed in a dedicated section

## App Structure / Architecture

```
greenviro-farewell/
├── index.html              # Main HTML file
├── server.js               # Express backend server
├── package.json            # Node.js dependencies
├── ecosystem.config.js     # PM2 configuration
├── greenviro.db           # SQLite database (created on first run)
├── src/
│   ├── styles.css         # All CSS styles (mobile-first design)
│   └── scripts.js         # JavaScript with API integration
├── references/            # Deployment guides and documentation
│   ├── deployment.md
│   ├── deployment-checklist.md
│   ├── quick-start.md
│   └── changes.md
└── README.md              # This file
```

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (lightweight, file-based)
- **Process Manager**: PM2 (for production deployment)
- **Fonts**: Google Fonts (Playfair Display, Open Sans)

### Color Palette
Gold color scheme ranging from light (`#FFFDF5`) to dark (`#FF6F00`), inspired by the net1io.com color guide.

### Features
1. **Visitor Tracking** - Unique visitor count stored in database
2. **Geolocation** - IP-based location detection via ipapi.co
3. **Persistent Message Storage** - Messages stored in SQLite, visible to all users
4. **Comments System** - Up to 100 messages, 200 characters each
5. **Rate Limiting** - Prevents spam (5 messages per IP per 15 minutes)
6. **Mobile-First Design** - Responsive layout for all devices
7. **XSS Protection** - HTML escaping for user inputs
8. **Real-time Updates** - All users see the same messages

## Quick Start (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open browser:**
   ```
   http://localhost:3000
   ```

## Production Deployment

### Digital Ocean Deployment

📖 **Deployment Guides:**
- **[Quick Start Guide](references/quick-start.md)** - Fast-track deployment (5 steps)
- **[Complete Deployment Guide](references/deployment.md)** - Full production setup with Nginx & SSL
- **[Deployment Checklist](references/deployment-checklist.md)** - Interactive step-by-step checklist
- **[Changes Summary](references/changes.md)** - What changed and why

Quick summary:
1. Install Node.js and PM2 on your droplet
2. Upload files and run `npm install`
3. Start with `pm2 start ecosystem.config.js`
4. Configure Nginx as reverse proxy (optional)
5. Setup SSL with Let's Encrypt (optional)

### API Endpoints

The backend provides these REST endpoints:

- `GET /api/messages` - Retrieve all messages
- `POST /api/messages` - Submit a new message
- `GET /api/visitors/count` - Get total visitor count
- `POST /api/visitors` - Track a visitor
- `GET /api/health` - Server health check

## Usage

1. Open `index.html` in a web browser
2. Visitors can:
   - View the farewell message
   - Leave their name and wishes
   - Click partner links to visit related websites
   - See all submitted messages

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

© 2025 net1io.com | All Rights Reserved

---

*With gratitude for 36 months of memories 🙏*
