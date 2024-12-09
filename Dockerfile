FROM node:16-alpine as build-step 
WORKDIR /app
COPY package.json ./
COPY ./src ./src
COPY ./public ./public
RUN npm install
RUN npm run build

FROM python:3.9-slim
WORKDIR /app
COPY --from=build-step /app/build ./build

RUN mkdir ./engine
COPY engine/Maestro.exe ./engine

RUN mkdir ./api 
COPY api/requirements.txt api/app.py ./api
RUN pip install -r ./api/requirements.txt

EXPOSE 3000
WORKDIR /app/api
CMD ["waitress-serve", "--port=3000", "app:app"]
