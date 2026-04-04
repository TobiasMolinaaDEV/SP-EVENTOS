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

// POST reservas
app.post("/reservas", async (req, res) => {
  const { cliente, evento, fecha, estado, total } = req.body;

  const result = await pool.query(
    "INSERT INTO reservas (cliente, evento, fecha, estado, total) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [cliente, evento, fecha, estado, total]
  );

  res.json(result.rows[0]);
});

app.listen(3001, () => {
  console.log("🔥 Backend corriendo en http://localhost:3001");
});

//borrar reservas
app.delete("/reservas/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM reservas WHERE id = $1", [id]);

  res.json({ ok: true });
});

//editar reservas
app.put("/reservas/:id", async (req, res) => {
  const { id } = req.params;
  const { cliente, evento, fecha, estado, total } = req.body;

  const result = await pool.query(
    `UPDATE reservas 
     SET cliente=$1, evento=$2, fecha=$3, estado=$4, total=$5
     WHERE id=$6 RETURNING *`,
    [cliente, evento, fecha, estado, total, id]
  );

  res.json(result.rows[0]);
});