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
├── index.html          # Main HTML file
├── src/
│   ├── styles.css      # All CSS styles (mobile-first design)
│   └── scripts.js      # JavaScript functionality
└── README.md           # This file
```

### Technology Stack
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid, Media Queries
- **Vanilla JavaScript** - No framework dependencies
- **Google Fonts** - Playfair Display, Open Sans

### Color Palette
Gold color scheme ranging from light (`#FFFDF5`) to dark (`#FF6F00`), inspired by the net1io.com color guide.

### Features
1. **Visitor Tracking** - Unique visitor count using localStorage
2. **Geolocation** - IP-based location detection via ipapi.co
3. **Comments System** - Up to 100 messages, 200 characters each
4. **Mobile-First Design** - Responsive layout for all devices
5. **XSS Protection** - HTML escaping for user inputs

## Deployment Instructions

### Option 1: Digital Ocean Apps (Static Site)

1. Push code to a Git repository (GitHub, GitLab, etc.)

2. Go to Digital Ocean Apps platform:
   - Click "Create App"
   - Connect your repository
   - Select the branch to deploy

3. Configure the app:
   - **Type**: Static Site
   - **Source Directory**: `/` (root)
   - **Output Directory**: Leave empty (static files)

4. Deploy and access your site at the provided URL

### Option 2: Digital Ocean Droplet with Nginx

1. SSH into your droplet:
   ```bash
   ssh root@your-droplet-ip
   ```

2. Install Nginx:
   ```bash
   apt update
   apt install nginx -y
   ```

3. Create site directory:
   ```bash
   mkdir -p /var/www/greenviro-farewell
   ```

4. Upload files (from your local machine):
   ```bash
   scp -r ./* root@your-droplet-ip:/var/www/greenviro-farewell/
   ```

5. Configure Nginx:
   ```bash
   nano /etc/nginx/sites-available/greenviro-farewell
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       root /var/www/greenviro-farewell;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

6. Enable site and restart Nginx:
   ```bash
   ln -s /etc/nginx/sites-available/greenviro-farewell /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

### Option 3: Digital Ocean Spaces (CDN)

1. Create a Space in Digital Ocean
2. Upload all files maintaining the directory structure
3. Enable CDN endpoint
4. Access via the CDN URL

## Data Persistence Note

**Current Implementation**: Uses `localStorage` for comments storage. This means:
- Messages persist on the same device/browser
- Different users on different devices see different messages
- Good for demo/testing purposes

**For Multi-User Persistence**, consider:

1. **Firebase Realtime Database** (Free tier available)
   ```javascript
   // Replace localStorage calls with Firebase
   import { getDatabase, ref, push, onValue } from "firebase/database";
   ```

2. **Supabase** (Free tier available)
   ```javascript
   // PostgreSQL backend with real-time subscriptions
   import { createClient } from '@supabase/supabase-js'
   ```

3. **Simple Backend API** (Node.js + JSON file or SQLite)
   ```javascript
   // Add API endpoints for GET/POST messages
   fetch('/api/messages', { method: 'POST', body: JSON.stringify(message) });
   ```

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
