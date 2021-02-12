FROM node:15.8.0
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD [ "node", "index.js" ]

# sudo docker run -d -p 8146:8146 --name ledwall-server ledwall-server

# sudo docker build --tag ledwall-server .

