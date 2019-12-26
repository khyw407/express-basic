From node:12.14.0-alpine3.11
RUN mkdir -p /app
WORKDIR /app
ADD . /app
RUN npm install
ENV NODE_ENV development
EXPOSE 3000
CMD ["npm", "start"]
