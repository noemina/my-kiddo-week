-- CreateTable
CREATE TABLE "_ActivityToKid" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivityToKid_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActivityExceptionToKid" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivityExceptionToKid_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ActivityToKid_B_index" ON "_ActivityToKid"("B");

-- CreateIndex
CREATE INDEX "_ActivityExceptionToKid_B_index" ON "_ActivityExceptionToKid"("B");

-- AddForeignKey
ALTER TABLE "_ActivityToKid" ADD CONSTRAINT "_ActivityToKid_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityToKid" ADD CONSTRAINT "_ActivityToKid_B_fkey" FOREIGN KEY ("B") REFERENCES "Kid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityExceptionToKid" ADD CONSTRAINT "_ActivityExceptionToKid_A_fkey" FOREIGN KEY ("A") REFERENCES "ActivityException"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityExceptionToKid" ADD CONSTRAINT "_ActivityExceptionToKid_B_fkey" FOREIGN KEY ("B") REFERENCES "Kid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: preserve existing single-kid links in the new join tables
-- before dropping the old direct kidId column.
INSERT INTO "_ActivityToKid" ("A", "B")
SELECT "id", "kidId" FROM "Activity" WHERE "kidId" IS NOT NULL;

INSERT INTO "_ActivityExceptionToKid" ("A", "B")
SELECT "id", "kidId" FROM "ActivityException" WHERE "kidId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_kidId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityException" DROP CONSTRAINT "ActivityException_kidId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "kidId",
ADD COLUMN     "includeInTypicalWeek" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ActivityException" DROP COLUMN "kidId";
