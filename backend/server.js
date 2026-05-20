const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// TEST
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🔥");
});

// GET reservas
app.get("/reservas", async (req, res) => {
  const result = await pool.query("SELECT * FROM reservas ORDER BY id DESC");
  res.json(result.rows);
});

// GET productos
// GET productos con stock real reservado
app.get("/productos", async (req, res) => {
  const result = await pool.query(`
    SELECT 
      p.id,
      p.nombre,
      p.categoria,
      p.stock_total,
      p.precio_unitario,
      COALESCE(SUM(
        CASE 
          WHEN r.estado != 'cancelada'
          THEN rp.cantidad
          ELSE 0
        END
      ), 0) AS reservados,
      p.stock_total - COALESCE(SUM(
        CASE 
          WHEN r.estado != 'cancelada'
          THEN rp.cantidad
          ELSE 0
        END
      ), 0) AS disponibles
    FROM productos p
    LEFT JOIN reserva_productos rp ON p.id = rp.producto_id
    LEFT JOIN reservas r ON r.id = rp.reserva_id
    GROUP BY p.id
    ORDER BY p.id DESC
  `);

  res.json(result.rows);
});

// GET disponibilidad de productos por fecha
app.get("/productos/disponibilidad", async (req, res) => {
  const { fecha } = req.query;

  if (!fecha) {
    return res.status(400).json({ error: "La fecha es obligatoria" });
  }

  const result = await pool.query(
    `
    SELECT 
      p.id,
      p.nombre,
      p.categoria,
      p.stock_total,
      p.precio_unitario, -- 🔥 ESTE ES EL FIX
      COALESCE(SUM(
        CASE 
          WHEN r.fecha = $1 AND r.estado != 'cancelada'
          THEN rp.cantidad 
          ELSE 0 
        END
      ), 0) AS reservados,
      p.stock_total - COALESCE(SUM(
        CASE 
          WHEN r.fecha = $1 AND r.estado != 'cancelada'
          THEN rp.cantidad 
          ELSE 0 
        END
      ), 0) AS disponibles
    FROM productos p
    LEFT JOIN reserva_productos rp ON p.id = rp.producto_id
    LEFT JOIN reservas r ON r.id = rp.reserva_id
    GROUP BY p.id
    ORDER BY p.id ASC
    `,
    [fecha]
  );

  res.json(result.rows);
});

// POST reservas
app.post("/reservas", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      cliente,
      telefono,
      direccion,
      email,
      evento,
      fecha,
      horario,
      lugar,
      estado,
      total,
      sena,
      observaciones,
      productos = [],
    } = req.body;

    const reservaResult = await client.query(
      `INSERT INTO reservas 
      (cliente, telefono, direccion, email, evento, fecha, horario, lugar, estado, total, sena, observaciones)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        cliente,
        telefono,
        direccion,
        email,
        evento,
        fecha,
        horario,
        lugar,
        estado,
        total,
        sena || 0,
        observaciones,
      ]
    );

    const reserva = reservaResult.rows[0];

    for (const producto of productos) {
      if (!producto.producto_id || !producto.cantidad) continue;

      await client.query(
        `INSERT INTO reserva_productos 
        (reserva_id, producto_id, cantidad)
        VALUES ($1,$2,$3)`,
        [reserva.id, producto.producto_id, producto.cantidad]
      );
    }

    await client.query("COMMIT");

    res.json(reserva);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error al crear la reserva" });
  } finally {
    client.release();
  }
});

// DELETE reservas
app.delete("/reservas/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM reservas WHERE id = $1", [id]);

  res.json({ ok: true });
});

// PUT reservas
app.put("/reservas/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    const {
      cliente,
      telefono,
      direccion,
      email,
      evento,
      fecha,
      horario,
      lugar,
      estado,
      total,
      sena,
      observaciones,
      productos = [],
    } = req.body;

    const reservaResult = await client.query(
      `UPDATE reservas 
       SET cliente=$1,
           telefono=$2,
           direccion=$3,
           email=$4,
           evento=$5,
           fecha=$6,
           horario=$7,
           lugar=$8,
           estado=$9,
           total=$10,
           sena=$11,
           observaciones=$12
       WHERE id=$13
       RETURNING *`,
      [
        cliente,
        telefono,
        direccion,
        email,
        evento,
        fecha,
        horario,
        lugar,
        estado,
        total,
        sena || 0,
        observaciones,
        id,
      ]
    );

    const reserva = reservaResult.rows[0];

    await client.query("DELETE FROM reserva_productos WHERE reserva_id = $1", [
      id,
    ]);

    for (const producto of productos) {
      if (!producto.producto_id || !producto.cantidad) continue;

      await client.query(
        `INSERT INTO reserva_productos 
        (reserva_id, producto_id, cantidad)
        VALUES ($1,$2,$3)`,
        [id, producto.producto_id, producto.cantidad]
      );
    }

    await client.query("COMMIT");

    res.json(reserva);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error al editar la reserva" });
  } finally {
    client.release();
  }
});
// GET productos
app.get("/productos", async (req, res) => {
  const result = await pool.query("SELECT * FROM productos ORDER BY id DESC");
  res.json(result.rows);
});

// POST producto
app.post("/productos", async (req, res) => {
  const { nombre, categoria, stock_total, precio_unitario } = req.body;

  const result = await pool.query(
    `INSERT INTO productos (nombre, categoria, stock_total, precio_unitario)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [nombre, categoria, stock_total, precio_unitario]
  );

  res.json(result.rows[0]);
});

// PUT producto
app.put("/productos/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, stock_total, precio_unitario } = req.body;

  const result = await pool.query(
    `UPDATE productos
     SET nombre=$1, categoria=$2, stock_total=$3, precio_unitario=$4
     WHERE id=$5
     RETURNING *`,
    [nombre, categoria, stock_total, precio_unitario, id]
  );

  res.json(result.rows[0]);
});

// DELETE producto
app.delete("/productos/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM productos WHERE id = $1", [id]);

  res.json({ ok: true });
});


// GET productos de una reserva
app.get("/reservas/:id/productos", async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT 
      rp.producto_id,
      rp.cantidad,
      p.nombre,
      p.precio_unitario
    FROM reserva_productos rp
    JOIN productos p ON p.id = rp.producto_id
    WHERE rp.reserva_id = $1`,
    [id]
  );

  res.json(result.rows);
});

//dashboard
app.get("/dashboard", async (req, res) => {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    const reservasActivas = await pool.query(`
      SELECT COUNT(*) FROM reservas WHERE estado != 'cancelada'
    `);

    const ingresos = await pool.query(`
      SELECT COALESCE(SUM(total), 0) FROM reservas WHERE estado != 'cancelada'
    `);

    const saldoPendiente = await pool.query(`
      SELECT COALESCE(SUM(total - sena), 0)
      FROM reservas
      WHERE estado != 'cancelada'
    `);

    const entregasHoy = await pool.query(`
      SELECT id, cliente, evento, horario, lugar, fecha, estado_entrega
      FROM reservas 
      WHERE en_entregas = true
      ORDER BY fecha ASC, horario ASC
    `);

    const proximosEventos = await pool.query(`
      SELECT id, cliente, evento, fecha, horario, lugar, total, sena
      FROM reservas
      WHERE fecha >= $1 AND estado != 'cancelada'
      ORDER BY fecha ASC, horario ASC
      LIMIT 5
    `, [hoy]);

    const productosCriticos = await pool.query(`
      SELECT nombre, disponibles
      FROM (
        SELECT 
          p.nombre,
          p.stock_total - COALESCE(SUM(
            CASE WHEN r.estado != 'cancelada' THEN rp.cantidad ELSE 0 END
          ), 0) AS disponibles
        FROM productos p
        LEFT JOIN reserva_productos rp ON p.id = rp.producto_id
        LEFT JOIN reservas r ON r.id = rp.reserva_id
        GROUP BY p.id
      ) stock
      WHERE disponibles <= 10
    `);

    res.json({
      reservas_activas: Number(reservasActivas.rows[0].count),
      ingresos: Number(ingresos.rows[0].coalesce),
      saldo_pendiente: Number(saldoPendiente.rows[0].coalesce),
      entregas_hoy: entregasHoy.rows,
      retiros_hoy: [],
      productos_criticos: productosCriticos.rows,
      proximos_eventos: proximosEventos.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error dashboard" });
  }
});

//clientes - conectados a la base de datos
app.get("/clientes", async (req, res) => {
  const result = await pool.query(`
    SELECT 
      c.*,
      COUNT(r.id) AS reservas
    FROM clientes c
    LEFT JOIN reservas r ON LOWER(r.cliente) = LOWER(c.nombre)
    GROUP BY c.id
    ORDER BY c.id DESC
  `);

  res.json(result.rows);
});

app.post("/clientes", async (req, res) => {
  const { nombre, email, telefono, direccion, observaciones } = req.body;

  const result = await pool.query(
    `INSERT INTO clientes (nombre, email, telefono, direccion, observaciones)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nombre, email, telefono, direccion, observaciones]
  );

  res.json(result.rows[0]);
});

app.put("/clientes/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, direccion, observaciones } = req.body;

  const result = await pool.query(
    `UPDATE clientes
     SET nombre=$1, email=$2, telefono=$3, direccion=$4, observaciones=$5
     WHERE id=$6
     RETURNING *`,
    [nombre, email, telefono, direccion, observaciones, id]
  );

  res.json(result.rows[0]);
});

app.delete("/clientes/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM clientes WHERE id = $1", [id]);

  res.json({ ok: true });
});
// get presupuestos
app.get("/presupuestos", async (req, res) => {
  const result = await pool.query(`
    SELECT *
    FROM presupuestos
    ORDER BY id DESC
  `);

  res.json(result.rows);
});

//get de los productos - presupuesto
app.get("/presupuestos/:id/productos", async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `
    SELECT 
      pp.*,
      p.nombre
    FROM presupuesto_productos pp
    JOIN productos p ON p.id = pp.producto_id
    WHERE pp.presupuesto_id = $1
    `,
    [id]
  );

  res.json(result.rows);
});

//POST Presupuesto
app.post("/presupuestos", async (req, res) => {
  try {
    const {
      cliente,
      telefono,
      direccion,
      email,
      evento,
      fecha,
      horario,
      lugar,
      subtotal,
      envio,
      descuento,
      total,
      sena,
      observaciones,
      productos,
    } = req.body;

    const presupuestoResult = await pool.query(
      `
      INSERT INTO presupuestos (
        cliente,
        telefono,
        direccion,
        email,
        evento,
        fecha,
        horario,
        lugar,
        subtotal,
        envio,
        descuento,
        total,
        sena,
        observaciones
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
      )
      RETURNING *
      `,
      [
        cliente,
        telefono,
        direccion,
        email,
        evento,
        fecha,
        horario,
        lugar,
        subtotal,
        envio,
        descuento,
        total,
        sena,
        observaciones,
      ]
    );

    const presupuesto = presupuestoResult.rows[0];

    if (productos?.length > 0) {
      for (const item of productos) {
        await pool.query(
          `
          INSERT INTO presupuesto_productos (
            presupuesto_id,
            producto_id,
            cantidad,
            precio_unitario,
            subtotal
          )
          VALUES ($1,$2,$3,$4,$5)
          `,
          [
            presupuesto.id,
            item.producto_id,
            item.cantidad,
            item.precio_unitario,
            item.subtotal,
          ]
        );
      }
    }

    res.json(presupuesto);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando presupuesto" });
  }
});

// eliminar presupuesto
app.delete("/presupuestos/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "DELETE FROM presupuestos WHERE id = $1",
    [id]
  );

  res.json({ ok: true });
});

// convertir presupuesto en reserva
// convertir presupuesto en reserva
app.post("/presupuestos/:id/convertir", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    const presupuestoResult = await client.query(
      `SELECT * FROM presupuestos WHERE id = $1`,
      [id]
    );

    const presupuesto = presupuestoResult.rows[0];

    if (!presupuesto) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Presupuesto no encontrado" });
    }

    if (presupuesto.estado === "convertido") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Este presupuesto ya fue convertido" });
    }

    const reservaResult = await client.query(
      `INSERT INTO reservas (
        cliente,
        telefono,
        direccion,
        email,
        evento,
        fecha,
        horario,
        lugar,
        estado,
        total,
        sena,
        observaciones
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        presupuesto.cliente,
        presupuesto.telefono,
        presupuesto.direccion,
        presupuesto.email,
        presupuesto.evento,
        presupuesto.fecha,
        presupuesto.horario,
        presupuesto.lugar,
        "confirmada",
        presupuesto.total,
        presupuesto.sena || 0,
        presupuesto.observaciones,
      ]
    );

    const reserva = reservaResult.rows[0];

    const productosResult = await client.query(
      `SELECT * FROM presupuesto_productos WHERE presupuesto_id = $1`,
      [id]
    );

    for (const item of productosResult.rows) {
      await client.query(
        `INSERT INTO reserva_productos (
          reserva_id,
          producto_id,
          cantidad
        )
        VALUES ($1,$2,$3)`,
        [reserva.id, item.producto_id, item.cantidad]
      );
    }

    await client.query(
      `UPDATE presupuestos
       SET estado = 'convertido'
       WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    res.json(reserva);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error convirtiendo presupuesto" });
  } finally {
    client.release();
  }
});
// enviar reserva a entregas
app.put(
  "/reservas/:id/enviar-entregas",
  async (req, res) => {

    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE reservas
      SET en_entregas = true
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json(result.rows[0]);
  }
);

// obtener entregas
// obtener entregas
app.get("/entregas", async (req, res) => {

  try {

    const reservasResult = await pool.query(`
      SELECT *
      FROM reservas
      WHERE en_entregas = true
      ORDER BY fecha ASC
    `);

    const reservas = reservasResult.rows;

    for (const reserva of reservas) {

      const productosResult = await pool.query(
        `
        SELECT
          rp.cantidad,
          p.nombre
        FROM reserva_productos rp
        JOIN productos p
          ON p.id = rp.producto_id
        WHERE rp.reserva_id = $1
        `,
        [reserva.id]
      );

      reserva.productos =
        productosResult.rows;
    }

    res.json(reservas);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo entregas",
    });
  }
});

// cambiar estado entrega
app.put(
  "/entregas/:id/estado",
  async (req, res) => {

    const { id } = req.params;
    const { estado_entrega } = req.body;

    const result = await pool.query(
      `
      UPDATE reservas
      SET estado_entrega = $1
      WHERE id = $2
      RETURNING *
      `,
      [estado_entrega, id]
    );

    res.json(result.rows[0]);
  }
);



app.listen(3001, () => {
  console.log("🔥 Backend corriendo en http://localhost:3001");
});