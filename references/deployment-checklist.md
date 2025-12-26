# Digital Ocean Deployment Checklist

Use this checklist to deploy your updated Greenviro farewell site.

## Pre-Deployment (Local)

- [ ] Test locally first
  ```bash
  npm install
  npm start
  ```
- [ ] Visit http://localhost:3000 and test sending messages
- [ ] Open in second browser/incognito and verify messages sync
- [ ] Commit and push to Git (if using version control)

---

## Digital Ocean Droplet Setup

### 1. Connect & Prepare
- [ ] SSH into droplet: `ssh root@YOUR_DROPLET_IP`
- [ ] Update system: `apt update && apt upgrade -y`

### 2. Install Node.js
- [ ] Install Node.js:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  apt install -y nodejs
  ```
- [ ] Verify: `node --version` (should be v18.x.x)
- [ ] Verify: `npm --version`

### 3. Install PM2
- [ ] Install PM2: `npm install -g pm2`
- [ ] Verify: `pm2 --version`

### 4. Upload Files
Choose one method:

**Method A: Git Clone**
- [ ] Navigate to directory: `cd /var/www`
- [ ] Clone repository: `git clone YOUR_REPO_URL greenviro-farewell`
- [ ] Enter directory: `cd greenviro-farewell`

**Method B: SCP Upload (from local machine)**
- [ ] Run from your local machine:
  ```bash
  scp -r /Users/rogerwoolie/Downloads/temp_greenviro_engagement/* root@YOUR_DROPLET_IP:/var/www/greenviro-farewell/
  ```
- [ ] SSH back into droplet: `ssh root@YOUR_DROPLET_IP`
- [ ] Navigate: `cd /var/www/greenviro-farewell`

### 5. Install Dependencies
- [ ] Run: `npm install`
- [ ] Wait for all packages to install (may take 2-3 minutes)
- [ ] Check for errors (ignore warnings)

### 6. Start Application
- [ ] Start with PM2: `pm2 start ecosystem.config.js`
- [ ] Check status: `pm2 status` (should show "online")
- [ ] View logs: `pm2 logs greenviro-farewell` (check for errors)
- [ ] Test API: `curl http://localhost:3000/api/health`
  - Should return: `{"status":"ok","timestamp":"..."}`

### 7. Configure Auto-Start on Reboot
- [ ] Save PM2 state: `pm2 save`
- [ ] Setup startup script: `pm2 startup`
- [ ] Copy and run the command that PM2 outputs

### 8. Test Direct Access
- [ ] In browser, visit: `http://YOUR_DROPLET_IP:3000`
- [ ] Should see the website
- [ ] Try sending a message
- [ ] Open in incognito/different device and verify message appears

---

## Optional: Setup Nginx Reverse Proxy

### 9. Install Nginx
- [ ] Install: `apt install -y nginx`
- [ ] Verify: `nginx -v`

### 10. Configure Nginx
- [ ] Create config file:
  ```bash
  nano /etc/nginx/sites-available/greenviro-farewell
  ```
- [ ] Paste this configuration:
  ```nginx
  server {
      listen 80;
      server_name YOUR_DOMAIN_OR_IP;

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
- [ ] Save and exit (Ctrl+X, Y, Enter)
- [ ] Enable site:
  ```bash
  ln -s /etc/nginx/sites-available/greenviro-farewell /etc/nginx/sites-enabled/
  rm /etc/nginx/sites-enabled/default
  ```
- [ ] Test config: `nginx -t`
- [ ] Restart Nginx: `systemctl restart nginx`

### 11. Configure Firewall
- [ ] Allow SSH: `ufw allow ssh`
- [ ] Allow HTTP: `ufw allow http`
- [ ] Allow HTTPS: `ufw allow https`
- [ ] Enable firewall: `ufw enable`
- [ ] Check status: `ufw status`

### 12. Test Nginx Access
- [ ] In browser, visit: `http://YOUR_DROPLET_IP` (no port needed!)
- [ ] Should see the website
- [ ] Test sending messages again

---

## Optional: Add SSL Certificate

### 13. Install Certbot
- [ ] Install: `apt install -y certbot python3-certbot-nginx`

### 14. Get SSL Certificate
- [ ] Run certbot: `certbot --nginx -d YOUR_DOMAIN.com`
- [ ] Follow prompts (enter email, agree to terms)
- [ ] Choose: Redirect HTTP to HTTPS (option 2)

### 15. Test HTTPS
- [ ] Visit: `https://YOUR_DOMAIN.com`
- [ ] Check for green padlock in browser
- [ ] Test sending messages

### 16. Setup Auto-Renewal
- [ ] Test renewal: `certbot renew --dry-run`
- [ ] Should complete without errors

---

## Final Verification

- [ ] Website loads at your domain/IP
- [ ] Messages can be sent and appear immediately
- [ ] Messages are visible on other devices/browsers
- [ ] Visitor counter increments correctly
- [ ] Location and time display correctly
- [ ] No JavaScript errors in browser console (F12)

---

## Post-Deployment

### Setup Monitoring
- [ ] Check app status: `pm2 status`
- [ ] View real-time logs: `pm2 logs greenviro-farewell`
- [ ] Monitor resources: `pm2 monit`

### Backup Database
- [ ] Create backup script:
  ```bash
  echo "0 2 * * * cp /var/www/greenviro-farewell/greenviro.db /var/backups/greenviro-\$(date +\%Y\%m\%d).db" | crontab -
  ```
- [ ] Verify cron job: `crontab -l`

### Share the Site
- [ ] Share URL with colleagues
- [ ] Test from multiple devices
- [ ] Monitor for any issues in first 24 hours

---

## Troubleshooting Commands

If something goes wrong:

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs greenviro-farewell --lines 50

# Restart application
pm2 restart greenviro-farewell

# Check Nginx status
systemctl status nginx

# View Nginx error logs
tail -f /var/log/nginx/error.log

# Test API directly
curl http://localhost:3000/api/messages

# Check if port 3000 is in use
lsof -i :3000

# Check disk space
df -h

# Check memory usage
free -h
```

---

## Need Help?

- **Application logs**: `pm2 logs greenviro-farewell`
- **Nginx logs**: `tail -f /var/log/nginx/error.log`
- **System logs**: `journalctl -xe`
- **Health check**: `curl http://localhost:3000/api/health`

Full guide: [DEPLOYMENT.md](DEPLOYMENT.md)
Quick guide: [QUICK-START.md](QUICK-START.md)

---

**Deployment completed!** 🎉

Date: _______________
Deployed by: _______________
Server IP: _______________
Domain: _______________
