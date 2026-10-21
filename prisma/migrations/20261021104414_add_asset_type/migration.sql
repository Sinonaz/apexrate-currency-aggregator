-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('CRYPTO', 'FIAT');

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "type" "AssetType" NOT NULL DEFAULT 'CRYPTO';
