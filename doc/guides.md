# Guides

## Git setup
To setup git, we need to create a new SSH key.

- open a new PowerShell window.
- generate a new key and copy it with the following commands (replace your email)
    ```pwsh
    ssh-keygen -t ed25519 -C <email>
    cat ~/.ssh/id_ed25519.pub | clip
    ```

- visit the [keys settings](https://github.com/settings/keys) on GitHub and add a new SSH key.
- now you can push to repos using the SSH link they provide (should look similar to `git@github.com:user/repo.git`)

More info can be found here: [Connecting to GitHub with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

## Server setup
We use a Linux VM for this project.

### VM Setup
- Set up a standard virtual machine using the latest Ubuntu version (e.g., *Ubuntu Server 24.04 LTS - x64 Gen2*)
- Set up the administrator account with an SSH key (used to log in later)
- For the inbound ports, allow standard web ports (22, 80 & 443)

### Open the DB port (Development environment only)
- Create a new inbound port rule to allow local database testing connections:
  - Source: Any
  - Source port range: `*`
  - Destination: Any
  - Service: Custom
  - Destination port ranges: 33061
  - Protocol: TCP
  - Action: Allow

### Custom DNS
- Assign a desired DNS name label under your server infrastructure configuration options.
- The resulting domain address can be used instead of the raw public IP address.

### Software Configuration
Execute the following on the target VM instance:

```sh
DOMAIN=<your-domain>.com
EMAIL=<your-email@example.com>
MYSQL_PORT=33061
MYSQL_PASSWORD=<your-mysql-password>
FRONTEND_PORT=3000
BACKEND_PORT=5000

# install nginx & mysql
sudo apt update && sudo apt upgrade -y
sudo apt install nginx mysql-server -y

# mysql config
sudo systemctl restart mysql
sudo sh -c "cat >> /etc/mysql/mysql.conf.d/mysqld.cnf" <<-EOT
port = ${MYSQL_PORT}
bind-address = 0.0.0.0
mysqlx-bind-address = 0.0.0.0
EOT
sudo mysql -e "CREATE USER 'gdsd'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON gdsd_production.* TO 'gdsd'@'%' WITH GRANT OPTION;"
sudo mysql -e "GRANT ALL PRIVILEGES ON gdsd_development.* TO 'gdsd'@'%' WITH GRANT OPTION;"

# add nginx config
sudo usermod -aG gdsd www-data
sudo mv /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak
sudo sh -c "cat > /etc/nginx/sites-available/default" <<-EOT
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        root /home/gdsd/frontend;
        try_files \$uri \$uri/ /index.html;
    }

    location /socket.io {
        proxy_pass http://localhost:${BACKEND_PORT};

        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /api {
        return 302 \$scheme://\$host/api/;
    }

    location ^~ /api/ {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        rewrite /api(.*) \$1 break;
    }
}
EOT

# start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# ssl Setup
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos -m${EMAIL}

# install node environment
sudo apt-get install -y curl
curl -fsSL [https://deb.nodesource.com/setup_22.x](https://deb.nodesource.com/setup_22.x) -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
sudo apt-get install -y nodejs
rm nodesource_setup.sh

# create backend systemd service
sudo sh -c "cat > /etc/systemd/system/backend.service" <<-EOT
[Unit]
Description=GDSD Backend service
After=mysqld.service
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=30s
User=gdsd
WorkingDirectory=/home/gdsd/backend
ExecStart=node .

[Install]
WantedBy=multi-user.target
EOT

# start & enable backend on boot
sudo systemctl start backend
sudo systemctl enable backend