FROM node:12

ENV PORT 3000

# Create app directory
RUN mkdir -p /usr/src/app

# Installing dependencies
#COPY package.json /usr/src/app/
#RUN npm install

# Copying source files
COPY . /usr/src/app/
WORKDIR /usr/src/app
RUN rm -rf node_modules
RUN npm install
RUN npm install express --save
# Building app
#RUN npm run build
EXPOSE 3000

# Running the app
CMD "npm" "run" "dev"
