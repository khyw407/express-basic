FROM node:12.14.0-alpine3.11
RUN mkdir -p /app
ADD . /app
WORKDIR /app
RUN npm install --unsafe-perm
EXPOSE 3000
CMD ["npm", "start"]
