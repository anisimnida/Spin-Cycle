-- CreateTable
CREATE TABLE "Laundry" (
    "id" TEXT NOT NULL,
    "laundry_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "operating_hours" TEXT NOT NULL,
    "website" TEXT,
    "contact" TEXT,
    "maps" TEXT,
    "service_type" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "Laundry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "laundryId" TEXT NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Laundry_laundry_id_key" ON "Laundry"("laundry_id");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_laundryId_key" ON "Favorite"("userId", "laundryId");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_laundryId_fkey" FOREIGN KEY ("laundryId") REFERENCES "Laundry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
