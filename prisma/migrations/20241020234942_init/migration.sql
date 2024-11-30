-- CreateTable
CREATE TABLE "clients_online" (
    "id_client" SERIAL NOT NULL,
    "address" VARCHAR(100),
    "date_time" TIMESTAMP(6),
    "tlf" VARCHAR(20),

    CONSTRAINT "clients_online_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" SERIAL NOT NULL,
    "status" BOOLEAN,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id_pago" SERIAL NOT NULL,
    "id_pedido" INTEGER,
    "date_time" DATE,
    "status" VARCHAR(20),
    "ref_" INTEGER,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "id_client" INTEGER,
    "id_mesa" INTEGER,
    "status" VARCHAR(20),
    "delivery" BOOLEAN,
    "cedula" INTEGER,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_platos" (
    "id" SERIAL NOT NULL,
    "id_pedido" INTEGER,
    "id_plato" INTEGER,

    CONSTRAINT "pedidos_platos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30),
    "precio" DECIMAL(3,2),
    "descripcion" VARCHAR(100),
    "cantidad" INTEGER,
    "img" VARCHAR(255),

    CONSTRAINT "platos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "ci" INTEGER NOT NULL,
    "name" VARCHAR(20),
    "password" VARCHAR(20),
    "rol" VARCHAR(20),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "clients_online"("id_client") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_mesa_fkey" FOREIGN KEY ("id_mesa") REFERENCES "mesas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos_platos" ADD CONSTRAINT "pedidos_platos_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos_platos" ADD CONSTRAINT "pedidos_platos_id_plato_fkey" FOREIGN KEY ("id_plato") REFERENCES "platos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
