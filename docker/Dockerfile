FROM node:6.3.0

MAINTAINER jkelvie

EXPOSE 443 3001

WORKDIR /opt

RUN mkdir skillbot-server

WORKDIR /opt/skillbot-server

COPY bin/ ./bin/

COPY src/ ./src/

COPY *.json ./

RUN npm install --quiet

RUN npm run tsc

CMD npm start