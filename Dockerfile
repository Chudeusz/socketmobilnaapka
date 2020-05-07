FROM node:8.9.4

WORKDIR /app

RUN npm install -g nodemon

RUN mkdir -p /app/node_modules && chown -R node:node /app

COPY package*.json ./

RUN npm install

COPY . .

COPY --chown=node:node . .

USER node

EXPOSE 8080

CMD ["nodemon"]