-- Remember the first tour per user, across sessions and devices.
ALTER TABLE "User" ADD COLUMN "productTourSeenAt" TIMESTAMP(3);
