/*
  Warnings:

  - Added the required column `code` to the `Park` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `Park` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Park" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "image_url" TEXT NOT NULL;
