FROM node:12.22.1-alpine AS devo

MAINTAINER Soubhagya R Nayak <soubhagya.r.nayak@gmail.com>

WORKDIR ./app

COPY package*.json ./

RUN npm install --global typescript

RUN npm install

COPY . .

RUN npm run build

FROM node:12.22.1-alpine as prod

WORKDIR ./app

COPY package*.json ./

RUN npm install --global ts-node typescript

RUN npm ci --only=production

COPY --from=devo ./app/dist ./dist
COPY --from=devo ./app/views ./dist/views
COPY --from=devo ./app/public ./dist/public
COPY --from=devo ./app/node_modules/bootstrap/dist ./dist/node_modules/bootstrap/dist

EXPOSE 3000

#CMD [ "npm", "start", "server" ]

CMD ["node", "./dist/src/main.js"]
