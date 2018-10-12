# Back of EasyDrive Project
Back of EasyDrive Project, coded with ExpressJS  
Usable road :  
* POST `/push` to post data  
* GET `/push` to get all the data  
* GET `/push/:type` to get data of type `type` (join, uplink, downlink)  

## Installation
Required package:
* NodeJS
* MongoDB > 2.6
* nginx
* pm2
* certbot

### Installation of NodeJS
```
sudo apt install nodejs-legacy  
```
  
### Installation of MongoDB
You will need `MongoDB Community Edition` to run MongoDB on Linux.  
Go to [tutorial section of MongoDB](https://docs.mongodb.com/manual/tutorial/), select your OS and follow their instructions.  
  
Example for Ubuntu:  
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### Installation of nginx
```
sudo apt install nginx
```

### Installation of pm2
```
sudo apt install pm2
```

## Setup
### Configuration of ExpressJS
Create a file named `config.js`.
``` js
var config = {};

config.web = {};
config.cred = {};

config.cred.keyhead = '';
config.cred.getmdp = '';
config.web.port = process.env.WEB_PORT || XXXX;

module.exports = config;
```

`config.cred.keyhead` correspond to the value from `keyhead` header from Objenious API.  
`config.cred.getmdp` is the password to access to `GET /push`.  
`XXXX` correspond to port used for ExpressJS.  

### Creation of HTTPS certificate and key
Install [certbot](https://certbot.eff.org/all-instructions).  
Create a certificate :  
```
certbot certonly --standalone -d www.votreDomaine --rsa-key-size 4096
```



### Configuration of NGINX
Create a file named `api-easydrive.conf` in `/etc/nginx/sites-available`.
``` conf
upstream node_server {
    server localhost:3000;
}

server {
  listen 80;
  listen [::]:80;
  server_name api.easydrive.cs-campus.fr www.api.easydrive.cs-campus.fr;
}

#Activez le https
server {
  server_name api.easydrive.cs-campus.fr www.api.easydrive.cs-campus.fr;
  listen 443 ssl;

  ###certificat Let's Encrypt
  ssl_certificate /etc/letsencrypt/live/api.easydrive.cs-campus.fr/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.easydrive.cs-campus.fr/privkey.pem;

  location / {
     proxy_ssl_session_reuse off;
     proxy_ssl_server_name on;
     proxy_pass http://node_server/;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'upgrade';
     proxy_set_header Host $host;
     proxy_cache_bypass $http_upgrade;
  }
}

#Redirection du http vers le https
server{
  listen 80;
  server_name api.easydrive.cs-campus.fr www.api.easydrive.cs-campus.fr;
  return 301 https://api.easydrive.cs-campus.fr;
}
```

Then restart service :  
```
sudo service nginx restart
```