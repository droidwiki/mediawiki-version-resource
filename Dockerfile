FROM node:10-alpine

WORKDIR /opt

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN chmod +x /opt/resource/*
