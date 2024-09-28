FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/mydatabase

RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "dev"]