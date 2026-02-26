"""
VietBridge AI — Automated Production Deployment
Deploys Next.js API + Admin SPA + H5 SPA + Landing Page to VPS.

Architecture:
  api.vietbridge.com     → Next.js :3000 (PM2 managed)
  admin.vietbridge.com   → Nginx static /var/www/vietbridge/admin/
  h5.vietbridge.com      → Nginx static /var/www/vietbridge/h5/
  vietbridge.com / www   → Nginx static /var/www/vietbridge/www/
  SSL via Let's Encrypt (certbot)

Usage:
  python scripts/deploy.py

Requires: pip install paramiko scp
"""

import os
import sys
import time
import subprocess
from pathlib import Path

try:
    import paramiko
    from scp import SCPClient
except ImportError:
    print("Installing required packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "scp"])
    import paramiko
    from scp import SCPClient

# ── Configuration ──────────────────────────────────────────────────────────
SERVER_IP = "149.28.154.133"
SERVER_USER = "root"
SERVER_PASS = "{oM7rD,85W_rhtbX"
DOMAIN = "vietbridge.com"
PROJECT_DIR = Path(__file__).resolve().parent.parent  # vietbridge-ai/

DB_NAME = "vietbridge_ai"
DB_USER = "vietbridge"
DB_PASS = "VB_db_2026!"

# ── Helpers ────────────────────────────────────────────────────────────────
def create_ssh_client():
    """Create and return an SSH client connected to the server."""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {SERVER_IP}...")
    client.connect(SERVER_IP, username=SERVER_USER, password=SERVER_PASS, timeout=30)
    print("  Connected!\n")
    return client


def run_cmd(ssh, cmd, check=True, timeout=300):
    """Execute a command on the remote server and print output."""
    print(f"  $ {cmd[:120]}{'...' if len(cmd) > 120 else ''}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    if out:
        for line in out.split("\n")[-5:]:
            try:
                print(f"    {line}")
            except UnicodeEncodeError:
                print(f"    {line.encode('ascii', 'replace').decode()}")
    if exit_code != 0 and check:
        print(f"    [ERROR] exit={exit_code}")
        if err:
            for line in err.split("\n")[-5:]:
                try:
                    print(f"    ERR: {line}")
                except UnicodeEncodeError:
                    print(f"    ERR: {line.encode('ascii', 'replace').decode()}")
    return exit_code, out, err


def upload_dir(ssh, local_path, remote_path):
    """Upload a local directory to remote server via tar + scp."""
    local_path = Path(local_path)
    tar_name = f"_upload_{local_path.name}.tar.gz"
    local_tar = PROJECT_DIR / tar_name

    # Create tar locally
    print(f"  Packing {local_path.name}...")
    subprocess.run(
        ["tar", "czf", str(local_tar), "-C", str(local_path.parent), local_path.name],
        check=True, capture_output=True
    )

    # Upload
    print(f"  Uploading {tar_name} ({local_tar.stat().st_size // 1024}KB)...")
    with SCPClient(ssh.get_transport()) as scp:
        scp.put(str(local_tar), f"/tmp/{tar_name}")

    # Extract on server
    run_cmd(ssh, f"mkdir -p {remote_path}")
    run_cmd(ssh, f"tar xzf /tmp/{tar_name} -C {remote_path} --strip-components=1")
    run_cmd(ssh, f"rm -f /tmp/{tar_name}", check=False)

    # Cleanup local tar
    local_tar.unlink(missing_ok=True)


def upload_file(ssh, local_path, remote_path):
    """Upload a single file to remote server."""
    print(f"  Uploading {Path(local_path).name}...")
    with SCPClient(ssh.get_transport()) as scp:
        scp.put(str(local_path), remote_path)


# ── Step 1: Install system dependencies ────────────────────────────────────
def step_install_deps(ssh):
    print("=" * 60)
    print("STEP 1: Install system dependencies")
    print("=" * 60)

    run_cmd(ssh, "export DEBIAN_FRONTEND=noninteractive && apt-get update -qq", timeout=120)

    # Install core packages
    run_cmd(ssh, (
        "export DEBIAN_FRONTEND=noninteractive && "
        "apt-get install -y -qq nginx certbot python3-certbot-nginx "
        "postgresql postgresql-contrib curl git "
        "build-essential ca-certificates gnupg 2>/dev/null | tail -3"
    ), timeout=300)

    # Install Node.js 20 LTS
    code, out, _ = run_cmd(ssh, "node --version 2>/dev/null", check=False)
    if code != 0 or "v20" not in out:
        print("  Installing Node.js 20...")
        run_cmd(ssh, (
            "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - 2>/dev/null && "
            "apt-get install -y -qq nodejs 2>/dev/null | tail -1"
        ), timeout=180)
    run_cmd(ssh, "node --version && npm --version")

    # Install PM2 globally
    run_cmd(ssh, "npm install -g pm2 2>/dev/null | tail -1", timeout=60)

    print()


# ── Step 2: Setup PostgreSQL ───────────────────────────────────────────────
def step_setup_db(ssh):
    print("=" * 60)
    print("STEP 2: Setup PostgreSQL")
    print("=" * 60)

    run_cmd(ssh, "systemctl enable postgresql && systemctl start postgresql")

    # Create user and database
    run_cmd(ssh, (
        f"sudo -u postgres psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='{DB_USER}'\" | "
        f"grep -q 1 || sudo -u postgres psql -c \"CREATE USER {DB_USER} WITH PASSWORD '{DB_PASS}';\""
    ), check=False)

    run_cmd(ssh, (
        f"sudo -u postgres psql -tc \"SELECT 1 FROM pg_database WHERE datname='{DB_NAME}'\" | "
        f"grep -q 1 || sudo -u postgres psql -c \"CREATE DATABASE {DB_NAME} OWNER {DB_USER};\""
    ), check=False)

    run_cmd(ssh, f"sudo -u postgres psql -c \"GRANT ALL ON DATABASE {DB_NAME} TO {DB_USER};\"", check=False)
    run_cmd(ssh, f"sudo -u postgres psql -d {DB_NAME} -c \"GRANT ALL ON SCHEMA public TO {DB_USER};\"", check=False)

    print()


# ── Step 3: Upload project files ──────────────────────────────────────────
def step_upload_project(ssh):
    print("=" * 60)
    print("STEP 3: Build & Upload project files")
    print("=" * 60)

    # Build H5 and Admin with production env
    print("  Building H5 (production)...")
    subprocess.run(
        ["npm", "run", "build"],
        cwd=str(PROJECT_DIR / "h5"),
        check=True, capture_output=True, shell=True
    )

    print("  Building Admin (production)...")
    subprocess.run(
        ["npm", "run", "build"],
        cwd=str(PROJECT_DIR / "admin"),
        check=True, capture_output=True, shell=True
    )

    # Prepare server directories
    run_cmd(ssh, "mkdir -p /var/www/vietbridge/{api,admin,h5,www}")

    # Upload H5 dist
    upload_dir(ssh, PROJECT_DIR / "h5" / "dist", "/var/www/vietbridge/h5")

    # Upload Admin dist
    upload_dir(ssh, PROJECT_DIR / "admin" / "dist", "/var/www/vietbridge/admin")

    # Upload Next.js API project (exclude node_modules, .next, android, dist)
    print("  Packing API project...")
    api_tar = PROJECT_DIR / "_upload_api.tar.gz"
    subprocess.run([
        "tar", "czf", str(api_tar),
        "--exclude=node_modules", "--exclude=.next",
        "--exclude=h5", "--exclude=admin",
        "--exclude=android", "--exclude=storage",
        "--exclude=.git", "--exclude=*.apk",
        "-C", str(PROJECT_DIR.parent), PROJECT_DIR.name
    ], check=True, capture_output=True)

    print(f"  Uploading API project ({api_tar.stat().st_size // 1024 // 1024}MB)...")
    with SCPClient(ssh.get_transport()) as scp:
        scp.put(str(api_tar), "/tmp/_upload_api.tar.gz")

    run_cmd(ssh, "rm -rf /var/www/vietbridge/api/src /var/www/vietbridge/api/prisma")
    run_cmd(ssh, "tar xzf /tmp/_upload_api.tar.gz -C /var/www/vietbridge/api --strip-components=1")
    run_cmd(ssh, "rm -f /tmp/_upload_api.tar.gz")
    api_tar.unlink(missing_ok=True)

    # Create landing page (simple redirect to h5)
    landing_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>VietBridge AI - 越南生活智能助手</title>
  <meta name="description" content="VietBridge AI 帮助在越华人轻松沟通、安全生活。中越翻译、防骗预警、越南语学习。">
  <style>
    *{{margin:0;padding:0;box-sizing:border-box}}
    body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;
      min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem}}
    .logo{{font-size:3rem;margin-bottom:1rem}}
    h1{{font-size:2rem;font-weight:700;margin-bottom:0.5rem}}
    .tagline{{font-size:1.1rem;opacity:0.9;margin-bottom:2rem;max-width:500px}}
    .features{{display:flex;gap:1.5rem;flex-wrap:wrap;justify-content:center;margin-bottom:2.5rem;max-width:600px}}
    .feat{{background:rgba(255,255,255,0.15);border-radius:12px;padding:1rem;width:150px;backdrop-filter:blur(10px)}}
    .feat-icon{{font-size:1.5rem;margin-bottom:0.5rem}}
    .feat-text{{font-size:0.85rem;opacity:0.9}}
    .cta{{display:inline-block;background:#fff;color:#764ba2;padding:1rem 2.5rem;border-radius:50px;
      font-size:1.1rem;font-weight:600;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s}}
    .cta:hover{{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,0.2)}}
    .links{{margin-top:2rem;opacity:0.7;font-size:0.85rem}}
    .links a{{color:#fff;margin:0 1rem;text-decoration:underline}}
  </style>
</head>
<body>
  <div class="logo">🇻🇳🤖🇨🇳</div>
  <h1>VietBridge AI</h1>
  <p class="tagline">在越华人智能助手 — 翻译沟通 · 防骗预警 · 越南语学习</p>
  <div class="features">
    <div class="feat"><div class="feat-icon">🔄</div><div class="feat-text">中越双语翻译</div></div>
    <div class="feat"><div class="feat-icon">🛡️</div><div class="feat-text">消费防骗预警</div></div>
    <div class="feat"><div class="feat-icon">📖</div><div class="feat-text">越南语教学</div></div>
    <div class="feat"><div class="feat-icon">💬</div><div class="feat-text">智能回复建议</div></div>
  </div>
  <a href="https://h5.{DOMAIN}" class="cta">立即使用</a>
  <div class="links">
    <a href="https://h5.{DOMAIN}">H5 版</a>
    <a href="https://admin.{DOMAIN}">管理后台</a>
    <a href="https://api.{DOMAIN}">API</a>
  </div>
</body>
</html>"""

    # Write landing page to temp file and upload
    landing_file = PROJECT_DIR / "_landing.html"
    landing_file.write_text(landing_html, encoding="utf-8")
    upload_file(ssh, str(landing_file), "/var/www/vietbridge/www/index.html")
    landing_file.unlink(missing_ok=True)

    print()


# ── Step 4: Setup API (Node.js + Prisma + PM2) ────────────────────────────
def step_setup_api(ssh):
    print("=" * 60)
    print("STEP 4: Setup API (Node.js + Prisma + PM2)")
    print("=" * 60)

    api_dir = "/var/www/vietbridge/api"

    # Write production .env
    env_content = f"""DATABASE_URL="postgresql://{DB_USER}:{DB_PASS}@localhost:5432/{DB_NAME}?schema=public"
NEXTAUTH_URL=https://api.{DOMAIN}
NEXTAUTH_SECRET=$(openssl rand -hex 32)
QWEN_API_KEY=sk-159e09c50bca4bf5980d19cf345d32ae
QWEN_API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NLS_APPKEY=wgJl9eCEVXt11a3E
NLS_TOKEN=35b2b6ea3ca74ef38e193d63a3b88420
NEXT_PUBLIC_APP_URL=https://api.{DOMAIN}
NODE_ENV=production
PORT=3000
"""
    # Generate actual secret on server
    run_cmd(ssh, f"""cat > {api_dir}/.env.local << 'ENVEOF'
DATABASE_URL="postgresql://{DB_USER}:{DB_PASS}@localhost:5432/{DB_NAME}?schema=public"
NEXTAUTH_URL=https://api.{DOMAIN}
NEXTAUTH_SECRET=$(openssl rand -hex 32)
QWEN_API_KEY=sk-159e09c50bca4bf5980d19cf345d32ae
QWEN_API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NLS_APPKEY=wgJl9eCEVXt11a3E
NLS_TOKEN=35b2b6ea3ca74ef38e193d63a3b88420
NEXT_PUBLIC_APP_URL=https://api.{DOMAIN}
NODE_ENV=production
PORT=3000
ENVEOF""")

    # Fix the NEXTAUTH_SECRET to be an actual random value
    run_cmd(ssh, f"""
SECRET=$(openssl rand -hex 32) && \
sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$SECRET|" {api_dir}/.env.local
""")

    # Install dependencies
    print("  Installing npm dependencies...")
    run_cmd(ssh, f"cd {api_dir} && npm ci --production=false 2>&1 | tail -3", timeout=300)

    # Generate Prisma client
    print("  Generating Prisma client...")
    run_cmd(ssh, f"cd {api_dir} && npx prisma generate 2>&1 | tail -3", timeout=60)

    # Push schema to database
    print("  Pushing database schema...")
    run_cmd(ssh, f"cd {api_dir} && npx prisma db push --accept-data-loss 2>&1 | tail -5", timeout=60)

    # Seed database
    print("  Seeding database...")
    run_cmd(ssh, f"cd {api_dir} && npx prisma db seed 2>&1 | tail -5", timeout=60, check=False)

    # Build Next.js
    print("  Building Next.js (this takes a while)...")
    run_cmd(ssh, f"cd {api_dir} && npm run build 2>&1 | tail -5", timeout=600)

    # Start with PM2
    print("  Starting with PM2...")
    run_cmd(ssh, f"pm2 delete vietbridge-api 2>/dev/null; true", check=False)
    run_cmd(ssh, f"cd {api_dir} && pm2 start npm --name vietbridge-api -- start", timeout=30)
    run_cmd(ssh, "pm2 save")
    run_cmd(ssh, "pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1", check=False)

    print()


# ── Step 5: Configure Nginx ───────────────────────────────────────────────
def step_setup_nginx(ssh):
    print("=" * 60)
    print("STEP 5: Configure Nginx")
    print("=" * 60)

    nginx_conf = f"""# VietBridge AI — Nginx Configuration
# Generated by deploy.py

# === api.{DOMAIN} → Next.js :3000 ===
server {{
    listen 80;
    server_name api.{DOMAIN};

    location / {{
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 10m;
    }}
}}

# === admin.{DOMAIN} → Admin SPA ===
server {{
    listen 80;
    server_name admin.{DOMAIN};
    root /var/www/vietbridge/admin;
    index index.html;

    location / {{
        try_files $uri $uri/ /index.html;
    }}

    location /api {{
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host api.{DOMAIN};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        client_max_body_size 10m;
    }}
}}

# === h5.{DOMAIN} → H5 Mobile SPA ===
server {{
    listen 80;
    server_name h5.{DOMAIN};
    root /var/www/vietbridge/h5;
    index index.html;

    location / {{
        try_files $uri $uri/ /index.html;
    }}

    location /api {{
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host api.{DOMAIN};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        client_max_body_size 10m;
    }}
}}

# === {DOMAIN} / www.{DOMAIN} → Landing Page ===
server {{
    listen 80;
    server_name {DOMAIN} www.{DOMAIN};
    root /var/www/vietbridge/www;
    index index.html;

    location / {{
        try_files $uri $uri/ /index.html;
    }}
}}
"""

    # Write nginx config
    conf_file = PROJECT_DIR / "_nginx_vietbridge.conf"
    conf_file.write_text(nginx_conf, encoding="utf-8")
    upload_file(ssh, str(conf_file), f"/etc/nginx/sites-available/{DOMAIN}")
    conf_file.unlink(missing_ok=True)

    # Enable site
    run_cmd(ssh, f"ln -sf /etc/nginx/sites-available/{DOMAIN} /etc/nginx/sites-enabled/{DOMAIN}")
    run_cmd(ssh, "rm -f /etc/nginx/sites-enabled/default", check=False)

    # Test and reload
    run_cmd(ssh, "nginx -t")
    run_cmd(ssh, "systemctl enable nginx && systemctl reload nginx")

    print()


# ── Step 6: SSL Certificates ──────────────────────────────────────────────
def step_setup_ssl(ssh):
    print("=" * 60)
    print("STEP 6: Setup SSL Certificates (Let's Encrypt)")
    print("=" * 60)

    domains = f"-d {DOMAIN} -d www.{DOMAIN} -d api.{DOMAIN} -d admin.{DOMAIN} -d h5.{DOMAIN}"

    run_cmd(ssh, (
        f"certbot --nginx {domains} "
        f"--non-interactive --agree-tos "
        f"--email admin@{DOMAIN} "
        f"--redirect 2>&1 | tail -10"
    ), timeout=120, check=False)

    # Setup auto-renewal
    run_cmd(ssh, "systemctl enable certbot.timer 2>/dev/null; true", check=False)
    run_cmd(ssh, "certbot renew --dry-run 2>&1 | tail -3", check=False)

    # Reload nginx with SSL
    run_cmd(ssh, "systemctl reload nginx")

    print()


# ── Step 7: Verify deployment ─────────────────────────────────────────────
def step_verify(ssh):
    print("=" * 60)
    print("STEP 7: Verify deployment")
    print("=" * 60)

    run_cmd(ssh, "pm2 list")
    run_cmd(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null || echo 'API not responding'")
    run_cmd(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost/ -H 'Host: {DOMAIN}' 2>/dev/null || echo 'Nginx not responding'")
    run_cmd(ssh, "systemctl status nginx --no-pager -l | head -5")
    run_cmd(ssh, "systemctl status postgresql --no-pager -l | head -5")

    print()
    print("=" * 60)
    print("DEPLOYMENT COMPLETE!")
    print("=" * 60)
    print(f"""
  Landing:  https://{DOMAIN}
  H5 App:   https://h5.{DOMAIN}
  Admin:    https://admin.{DOMAIN}
  API:      https://api.{DOMAIN}

  Server:   {SERVER_IP}
  PM2:      pm2 list / pm2 logs vietbridge-api
  Nginx:    /etc/nginx/sites-available/{DOMAIN}
  API dir:  /var/www/vietbridge/api/
""")


# ── Main ───────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("VietBridge AI — Production Deployment")
    print(f"Server: {SERVER_IP} | Domain: {DOMAIN}")
    print("=" * 60)
    print()

    ssh = create_ssh_client()

    try:
        step_install_deps(ssh)
        step_setup_db(ssh)
        step_upload_project(ssh)
        step_setup_api(ssh)
        step_setup_nginx(ssh)
        step_setup_ssl(ssh)
        step_verify(ssh)
    except Exception as e:
        print(f"\n[FATAL] Deployment failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        ssh.close()


if __name__ == "__main__":
    main()
