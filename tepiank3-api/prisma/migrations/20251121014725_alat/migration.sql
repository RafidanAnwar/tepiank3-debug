-- CreateTable
CREATE TABLE "parameter_peralatan" (
    "id" SERIAL NOT NULL,
    "parameterId" INTEGER NOT NULL,
    "peralatanId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "parameter_peralatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parameter_peralatan_parameterId_idx" ON "parameter_peralatan"("parameterId");

-- CreateIndex
CREATE INDEX "parameter_peralatan_peralatanId_idx" ON "parameter_peralatan"("peralatanId");

-- CreateIndex
CREATE UNIQUE INDEX "parameter_peralatan_parameterId_peralatanId_key" ON "parameter_peralatan"("parameterId", "peralatanId");

-- AddForeignKey
ALTER TABLE "parameter_peralatan" ADD CONSTRAINT "parameter_peralatan_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "parameters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parameter_peralatan" ADD CONSTRAINT "parameter_peralatan_peralatanId_fkey" FOREIGN KEY ("peralatanId") REFERENCES "peralatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
