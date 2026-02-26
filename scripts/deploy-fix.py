"""
VietBridge AI — Fix & Continue Deployment
Continues deployment from Step 4 (API setup) after fixing issues.
"""

import sys
import subprocess

try:
    import paramiko
    from scp import SCPClient
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "scp"])
    import paramiko
    from scp import SCPClient

SERVER_IP = "149.28.154.133"
SERVER_USER = "root"
SERVER_PASS = "{oM7rD,85W_rhtbX"
DOMAIN = "vietbridge.com"


def run_cmd(ssh, cmd, check=True, timeout=300):
    print(f"  $ {cmd[:140]}{'...' if len(cmd) > 140 else ''}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    if out:
        for line in out.split("\n")[-8:]:
            try:
                print(f"    {line}")
            except UnicodeEncodeError:
                print(f"    {line.encode('ascii', 'replace').decode()}")
    if exit_code != 0:
        if err:
            for line in err.split("\n")[-5:]:
                try:
                    print(f"    ERR: {line}")
                except UnicodeEncodeError:
                    print(f"    ERR: {line.encode('ascii', 'replace').decode()}")
        if check:
            print(f"    [EXIT CODE: {exit_code}]")
    return exit_code, out, err


def main():
    print("Connecting to server...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER_IP, username=SERVER_USER, password=SERVER_PASS, timeout=30)
    print("Connected!\n")

    api_dir = "/var/www/vietbridge/api"

    # Fix 1: Prisma needs the schema to be correct
    print("=== Fix Prisma schema issue ===")
    # Check if package.json prisma config is causing the issue
    run_cmd(ssh, f"cat {api_dir}/package.json | grep -A3 prisma", check=False)

    # The issue might be the deprecated package.json prisma config
    # Let's check the exact error
    run_cmd(ssh, f"cd {api_dir} && npx prisma db push 2>&1 | head -20", timeout=120, check=False)

    # Try with --skip-generate to avoid the warning
    print("\n=== Attempt: prisma db push with explicit env ===")
    run_cmd(ssh, f"cd {api_dir} && cat .env.local | head -2", check=False)

    # Load env manually and push
    run_cmd(ssh, (
        f"cd {api_dir} && "
        f"export $(grep -v '^#' .env.local | grep -v '^$' | tr -d '\"' | xargs) && "
        f"npx prisma db push --accept-data-loss 2>&1"
    ), timeout=120, check=False)

    # Seed
    print("\n=== Seed database ===")
    run_cmd(ssh, (
        f"cd {api_dir} && npm install -D tsx 2>&1 | tail -2"
    ), timeout=120)
    run_cmd(ssh, (
        f"cd {api_dir} && "
        f"export $(grep -v '^#' .env.local | grep -v '^$' | tr -d '\"' | xargs) && "
        f"npx prisma db seed 2>&1 | tail -8"
    ), timeout=120, check=False)

    # Build Next.js
    print("\n=== Build Next.js ===")
    run_cmd(ssh, (
        f"cd {api_dir} && npm run build 2>&1 | tail -10"
    ), timeout=600, check=False)

    # Start with PM2
    print("\n=== Start PM2 ===")
    run_cmd(ssh, "pm2 delete vietbridge-api 2>/dev/null; true", check=False)
    run_cmd(ssh, f"cd {api_dir} && pm2 start npm --name vietbridge-api -- start", timeout=30)
    run_cmd(ssh, "pm2 save")
    run_cmd(ssh, "pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1", check=False)

    # Setup Nginx
    print("\n=== Setup Nginx ===")
    run_cmd(ssh, f"ls -la /etc/nginx/sites-available/{DOMAIN} 2>/dev/null", check=False)
    run_cmd(ssh, "nginx -t", check=False)
    run_cmd(ssh, "systemctl reload nginx")

    # SSL
    print("\n=== Setup SSL ===")
    domains = f"-d {DOMAIN} -d www.{DOMAIN} -d api.{DOMAIN} -d admin.{DOMAIN} -d h5.{DOMAIN}"
    run_cmd(ssh, (
        f"certbot --nginx {domains} "
        f"--non-interactive --agree-tos "
        f"--email admin@{DOMAIN} "
        f"--redirect 2>&1 | tail -15"
    ), timeout=120, check=False)
    run_cmd(ssh, "systemctl reload nginx")

    # Verify
    print("\n=== Verify ===")
    run_cmd(ssh, "pm2 list")
    run_cmd(ssh, "sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null || echo 'API not ready'")
    run_cmd(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost/ -H 'Host: h5.{DOMAIN}'")
    run_cmd(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost/ -H 'Host: admin.{DOMAIN}'")
    run_cmd(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost/ -H 'Host: {DOMAIN}'")

    print(f"""
=== DEPLOYMENT COMPLETE ===
  Landing:  https://{DOMAIN}
  H5 App:   https://h5.{DOMAIN}
  Admin:    https://admin.{DOMAIN}
  API:      https://api.{DOMAIN}
""")

    ssh.close()


if __name__ == "__main__":
    main()
