# Deployment Guide - Digital Ocean

This guide will help you deploy the Greenviro Farewell site with persistent message storage on Digital Ocean.

## What Changed

The application now uses a **Node.js backend with SQLite database** instead of localStorage. This means:
- ✅ Messages are stored on the server and visible to all users
- ✅ Visitor count is tracked across all devices
- ✅ Data persists even when users clear their browser
- ✅ Simple, self-contained deployment (no external database needed)

## Prerequisites

- Digital Ocean Droplet (Ubuntu 20.04 or newer recommended)
- Domain name pointed to your droplet (optional but recommended)
- SSH access to your droplet

## Deployment Steps

### 1. Connect to Your Digital Ocean Droplet

```bash
ssh root@your_droplet_ip
```

### 2. Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js (version 18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### 4. Upload Your Files

You can use Git, SCP, or SFTP. Here's the Git method:

```bash
# On your droplet
cd /var/www
git clone <your-repository-url> greenviro-farewell
cd greenviro-farewell

# Or if you're uploading directly via SCP from your local machine:
# scp -r /Users/rogerwoolie/Downloads/temp_greenviro_engagement root@your_droplet_ip:/var/www/greenviro-farewell
```

### 5. Install Dependencies

```bash
cd /var/www/greenviro-farewell
npm install
```

### 6. Set Environment Variables

```bash
# Create .env file
cp .env.example .env

# Edit if needed (default PORT is 3000)
nano .env
```

### 7. Start the Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system reboot
pm2 startup
# Follow the command that PM2 outputs
```

### 8. Configure Nginx (Recommended)

If you want to use a domain name and serve on port 80/443:

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/greenviro-farewell
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/greenviro-farewell /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 9. (Optional) Add SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts
```

### 10. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

## Verifying Deployment

1. **Check if the server is running:**
   ```bash
   pm2 status
   pm2 logs greenviro-farewell
   ```

2. **Test the API:**
   ```bash
   curl http://localhost:3000/api/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

3. **Visit your site:**
   - Go to `http://your-domain.com` or `http://your_droplet_ip:3000`
   - Send a test message
   - Open in another browser/device and verify the message appears

## Common PM2 Commands

```bash
# View logs
pm2 logs greenviro-farewell

# Restart application
pm2 restart greenviro-farewell

# Stop application
pm2 stop greenviro-farewell

# View application status
pm2 status

# Monitor CPU/Memory
pm2 monit
```

## Backup Database

The SQLite database is stored in `greenviro.db` in the project root.

```bash
# Backup database
cp /var/www/greenviro-farewell/greenviro.db /var/backups/greenviro-$(date +%Y%m%d).db

# Setup automatic daily backups (cron)
crontab -e
# Add this line:
# 0 2 * * * cp /var/www/greenviro-farewell/greenviro.db /var/backups/greenviro-$(date +\%Y\%m\%d).db
```

## Updating the Application

```bash
# Navigate to project directory
cd /var/www/greenviro-farewell

# Pull latest changes
git pull

# Install any new dependencies
npm install

# Restart application
pm2 restart greenviro-farewell
```

## Troubleshooting

### Messages not appearing?
1. Check if server is running: `pm2 status`
2. Check logs: `pm2 logs greenviro-farewell`
3. Verify API is accessible: `curl http://localhost:3000/api/messages`

### Port already in use?
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change PORT in .env file
```

### Database permission errors?
```bash
# Ensure proper permissions
chown -R www-data:www-data /var/www/greenviro-farewell
chmod 664 /var/www/greenviro-farewell/greenviro.db
```

## Support

For issues or questions:
- Check PM2 logs: `pm2 logs greenviro-farewell`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Verify server health: `curl http://localhost:3000/api/health`

---

**Developed by [net1io.com](https://net1io.com)**
