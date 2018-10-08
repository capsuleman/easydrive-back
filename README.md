# Back of EasyDrive Project
Back of EasyDrive Project, coded with ExpressJS  
Usable road :  
POST /push to post data  
GET /push to get all the data  
GET /push/:type to get data typed (join, uplink, downlink)  

# Installation
```
#install nodejs
sudo apt install nodejs-legacy  
#install mongoDB (https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4  
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list  
sudo apt-get update  
sudo apt-get install -y mongodb-org  
```
