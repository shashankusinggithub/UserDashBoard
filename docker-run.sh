docker compose build 
docker compose exec backend npx prisma generate
docker compose up -d
docker compose exec backend npx prisma migrate dev --name init

