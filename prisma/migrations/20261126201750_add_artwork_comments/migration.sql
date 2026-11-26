-- CreateTable
CREATE TABLE "ArtworkComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artworkId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "ArtworkComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArtworkComment_artworkId_idx" ON "ArtworkComment"("artworkId");

-- CreateIndex
CREATE INDEX "ArtworkComment_authorId_idx" ON "ArtworkComment"("authorId");

-- AddForeignKey
ALTER TABLE "ArtworkComment" ADD CONSTRAINT "ArtworkComment_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtworkComment" ADD CONSTRAINT "ArtworkComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
