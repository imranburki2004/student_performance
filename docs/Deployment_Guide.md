# Online Deployment & Live Viva Hosting Guide
**EduPulse DIK — Govt. Degree College No. 1, Dera Ismail Khan**

---

This guide details three production deployment pathways for the FYP viva evaluation and permanent institutional hosting.

---

## Option 1: Cloudflare Tunnel / Ngrok (Fastest 1-Minute Live Demo from Your PC)
*Recommended for the final year project viva demonstration to show the project live on the examiner's smartphone or laptop without paying for cloud servers.*

### Using Cloudflare Tunnel (Free & No Signup Needed):
1. Download `cloudflared.exe` from [Cloudflare Releases](https://github.com/cloudflare/cloudflared/releases).
2. Start your local server in VS Code:
   ```bash
   npm start
   ```
3. In a second terminal window, run:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
4. Cloudflare will output a public HTTPS URL (e.g., `https://edupulse-gdc1.trycloudflare.com`).
5. Open this URL on any phone or send it to the examination committee!

---

## Option 2: Render / Railway Cloud Deployment (Free Managed Cloud)

1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial release of EduPulse DIK"
   git branch -M main
   git remote add origin https://github.com/<your-username>/edupulse-dik.git
   git push -u origin main
   ```
2. Log in to [Render.com](https://render.com) or [Railway.app](https://railway.app).
3. Click **"New Web Service"** and select your GitHub repository.
4. Set Build Command: `npm install`
5. Set Start Command: `node server.js`
6. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `DB_CLIENT` = `mysql` (Attach a free MySQL Database on Render/Railway and paste `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
   - `JWT_SECRET` = `edupulse_dik_secret_jwt_key_2026_super_secure_fyp`
7. Click **Deploy**. Your app is live with automatic SSL!

---

## Option 3: Dedicated VPS Deployment (Ubuntu 22.04 LTS / 24.04)
*For permanent institutional deployment on college servers.*

### 1. Server Packages Setup:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx mysql-server ufw
sudo npm install -g pm2
```

### 2. Database Import:
```bash
sudo mysql -u root -p < database/complete_import.sql
```

### 3. Application Deployment via PM2:
```bash
cd /var/www/student-performance-dashboard
npm install --production
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 4. Nginx Reverse Proxy Configuration:
Edit `/etc/nginx/sites-available/edupulse`:
```nginx
server {
    server_name portal.gdc1dik.edu.pk;

    location / {
        proxy_pass http://127.0.0.1:3000;
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
Enable site and obtain free SSL:
```bash
sudo ln -s /etc/nginx/sites-available/edupulse /etc/nginx/sites-enabled/
sudo systemctl restart nginx
sudo certbot --nginx -d portal.gdc1dik.edu.pk
```
