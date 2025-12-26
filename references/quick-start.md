# Quick Start Guide

## What's the Problem?

Your current site uses **localStorage** which only stores data in each visitor's browser. This means:
- ❌ Person A sends a message → only Person A sees it
- ❌ Person B sends a message → only Person B sees it
- ❌ Messages are NOT shared between users

## The Solution

We've added a **Node.js backend with SQLite database** so:
- ✅ Everyone sees ALL messages
- ✅ Messages are stored on the server
- ✅ Works across all devices and browsers

## Setup on Digital Ocean (Fast Track)

### Step 1: SSH into Your Droplet

```bash
ssh root@your_droplet_ip
```

### Step 2: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
npm install -g pm2
```

### Step 3: Upload Your Files

```bash
# Create directory
mkdir -p /var/www/greenviro-farewell
cd /var/www/greenviro-farewell

# Upload files (run this from your LOCAL machine, not the droplet)
# scp -r /Users/rogerwoolie/Downloads/temp_greenviro_engagement/* root@your_droplet_ip:/var/www/greenviro-farewell/
```

Or use Git:
```bash
# On your droplet
cd /var/www/greenviro-farewell
git clone <your-repo-url> .
```

### Step 4: Install & Start

```bash
# Install dependencies
npm install

# Start with PM2
pm2 start ecosystem.config.js

# Make it start on reboot
pm2 save
pm2 startup
# Run the command that PM2 outputs
```

### Step 5: Test It

```bash
# Check if running
pm2 status

# Test API
curl http://localhost:3000/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Step 6: Access Your Site

**Option A: Direct access (port 3000)**
```
http://your_droplet_ip:3000
```

**Option B: Setup Nginx (recommended)**

```bash
# Install Nginx
apt install -y nginx

# Create config
cat > /etc/nginx/sites-available/greenviro-farewell << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/greenviro-farewell /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default site
nginx -t
systemctl restart nginx

# Open firewall
ufw allow http
ufw allow https
```

Now access at: `http://your_droplet_ip`

## Verify It's Working

1. **Open site in Browser 1** → Send a message
2. **Open site in Browser 2** (different device/incognito) → You should see the message!

## Common Issues

### "Cannot connect to server"
```bash
# Check if server is running
pm2 status
pm2 logs greenviro-farewell

# Restart if needed
pm2 restart greenviro-farewell
```

### "Port 3000 already in use"
```bash
# Find what's using it
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change port in .env file
echo "PORT=3001" > .env
pm2 restart greenviro-farewell
```

### "Messages still not syncing"
1. Clear browser cache
2. Check browser console for errors (F12)
3. Verify API works: `curl http://your_ip/api/messages`

## Need More Details?

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide with SSL, domain setup, and production best practices.

---

**Questions?** Check the logs: `pm2 logs greenviro-farewell`
