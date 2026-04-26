import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";

type Item = {
  descripcion: string;
  unidades: number;
  precio: number;
};

type Datos = {
  nombre: string;
  direccion: string;
  cuit: string;
  telefono: string;
  email: string;
};

const datosVacios: Datos = {
  nombre: "",
  direccion: "",
  cuit: "",
  telefono: "",
  email: "",
};

const formatoMoneda = (valor: number) =>
  `$${Number(valor || 0).toLocaleString("es-AR")}`;

export default function Presupuestos() {
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState("");
  const [validez, setValidez] = useState("");

  const [empresa, setEmpresa] = useState<Datos>(datosVacios);
  const [cliente, setCliente] = useState<Datos>(datosVacios);

  const [descuento, setDescuento] = useState(0);
  const [iva, setIva] = useState(21);
  const [logo, setLogo] = useState<string | null>(null);

  const [items, setItems] = useState<Item[]>([
    { descripcion: "", unidades: 1, precio: 0 },
  ]);

  const subtotal = items.reduce(
    (acc, item) => acc + item.unidades * item.precio,
    0
  );

  const montoDescuento = Number(descuento) || 0;
  const baseConDescuento = Math.max(subtotal - montoDescuento, 0);
  const montoIva = baseConDescuento * ((Number(iva) || 0) / 100);
  const total = baseConDescuento + montoIva;

  const actualizarDato = (
    tipo: "empresa" | "cliente",
    campo: keyof Datos,
    valor: string
  ) => {
    if (tipo === "empresa") {
      setEmpresa((prev) => ({ ...prev, [campo]: valor }));
    } else {
      setCliente((prev) => ({ ...prev, [campo]: valor }));
    }
  };

  const cargarLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const agregarItem = () => {
    setItems((prev) => [...prev, { descripcion: "", unidades: 1, precio: 0 }]);
  };

  const actualizarItem = (index: number, campo: keyof Item, valor: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [campo]: campo === "descripcion" ? valor : Number(valor),
            }
          : item
      )
    );
  };

  const eliminarItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const cargarLogoDefault = async () => {
    try {
      const res = await fetch("/logo-sp-eventos.png");
      if (!res.ok) return null;

      const blob = await res.blob();

      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const generarPDF = async () => {
    const doc = new jsPDF();

    const verde = "#009B72";
    const verdeOscuro = "#006B50";
    const verdeSuave = "#E8F7F2";
    const celesteLinea = "#D8EEF2";
    const negro = "#111827";
    const gris = "#F3F4F6";

    const texto = (valor: string) => valor || "-";
    const logoPDF = logo || (await cargarLogoDefault());

    // Coordenadas base
    const x0 = 10;
    const x1 = 105;
    const x2 = 130;
    const x3 = 160;
    const x4 = 200;

    doc.setDrawColor(verdeOscuro);
    doc.setLineWidth(0.6);
    doc.rect(10, 10, 190, 270);

    // Header
    doc.rect(10, 10, 190, 24);

    if (logoPDF) {
      doc.addImage(logoPDF, "PNG", 14, 13, 28, 18);
    } else {
      doc.setFillColor(verde);
      doc.circle(24, 22, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("SP", 24, 25, { align: "center" });
    }

    doc.setTextColor(negro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Presupuesto ${numero ? `N° ${numero}` : "(Número)"}`, 105, 24, {
      align: "center",
    });

    doc.setFillColor(verde);
    doc.rect(10, 34, 190, 5, "F");

    // Empresa / cliente
    doc.setDrawColor(verdeOscuro);
    doc.setLineWidth(0.45);
    doc.rect(10, 39, 95, 43);
    doc.rect(105, 39, 95, 43);

    doc.setFontSize(7.5);
    doc.setTextColor(negro);

    doc.setFont("helvetica", "bold");
    doc.text(texto(empresa.nombre || "Silvina Prette Eventos"), 14, 47);
    doc.text(texto(cliente.nombre || "Cliente"), 109, 47);

    doc.setFont("helvetica", "normal");
    doc.text(`Dirección: ${texto(empresa.direccion)}`, 14, 54);
    doc.text(`CUIT: ${texto(empresa.cuit)}`, 14, 61);
    doc.text(`Teléfono: ${texto(empresa.telefono)}`, 14, 68);
    doc.text(`Email: ${texto(empresa.email)}`, 14, 75);

    doc.text(`Dirección: ${texto(cliente.direccion)}`, 109, 54);
    doc.text(`CUIT/DNI: ${texto(cliente.cuit)}`, 109, 61);
    doc.text(`Teléfono: ${texto(cliente.telefono)}`, 109, 68);
    doc.text(`Email: ${texto(cliente.email)}`, 109, 75);

    // Fecha / validez
    doc.rect(10, 82, 95, 9);
    doc.rect(105, 82, 95, 9);

    doc.setFont("helvetica", "bold");
    doc.text("Fecha del presupuesto", 14, 88);
    doc.text("Validez", 140, 88);

    doc.setFont("helvetica", "normal");
    doc.text(fecha || "XX/XX/XXXX", 72, 88);
    doc.text(`${validez || "X"} días`, 172, 88);

    // Tabla
    const tableTop = 91;
    const tableBottom = 210;

    doc.setFillColor(gris);
    doc.rect(10, tableTop, 190, 8, "F");

    doc.setDrawColor(verdeOscuro);
    doc.setLineWidth(0.45);
    doc.rect(10, tableTop, 190, tableBottom - tableTop);

    doc.line(x1, tableTop, x1, tableBottom);
    doc.line(x2, tableTop, x2, tableBottom);
    doc.line(x3, tableTop, x3, tableBottom);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("DESCRIPCIÓN", 14, tableTop + 5.5);
    doc.text("UNIDADES", 117.5, tableTop + 5.5, { align: "center" });
    doc.text("PRECIO", 145, tableTop + 5.5, { align: "center" });
    doc.text("TOTAL", 180, tableTop + 5.5, { align: "center" });

    let y = tableTop + 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);

    items.forEach((item) => {
      if (y > tableBottom - 8) return;

      const totalItem = item.unidades * item.precio;

      doc.setTextColor(negro);
      doc.text(texto(item.descripcion).slice(0, 48), 14, y);
      doc.text(String(item.unidades), 117.5, y, { align: "center" });
      doc.text(formatoMoneda(item.precio), 156, y, { align: "right" });
      doc.text(formatoMoneda(totalItem), 196, y, { align: "right" });

      doc.setDrawColor(celesteLinea);
      doc.setLineWidth(0.2);
      doc.line(10, y + 3, 200, y + 3);

      y += 7;
    });

    while (y < tableBottom - 4) {
      doc.setDrawColor(celesteLinea);
      doc.setLineWidth(0.2);
      doc.line(10, y + 3, 200, y + 3);
      y += 7;
    }

    // Totales
    const totalsTop = 210;
    const totalsBottom = 240;

    doc.setDrawColor(verdeOscuro);
    doc.setLineWidth(0.5);
    doc.rect(10, totalsTop, 190, totalsBottom - totalsTop);

    // Alineado con columnas de la tabla
    doc.line(x1, totalsTop, x1, totalsBottom);
    doc.line(x3, totalsTop, x3, totalsBottom);

    // Fondo para TOTAL
    doc.setFillColor(verdeSuave);
    doc.rect(x1, 233, 95, 7, "F");

    doc.setDrawColor(verdeOscuro);
    doc.setLineWidth(0.35);
    doc.line(x1, 233, x4, 233);

    const baseY = 218;

    doc.setTextColor(negro);
    doc.setFontSize(7.5);

    doc.setFont("helvetica", "bold");
    doc.text("SUB-TOTAL", 156, baseY, { align: "right" });
    doc.text("DESCUENTO", 156, baseY + 7, { align: "right" });
    doc.text(`IVA ${iva}%`, 156, baseY + 14, { align: "right" });
    doc.text("TOTAL PRESUPUESTO", 156, baseY + 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.text(formatoMoneda(subtotal), 196, baseY, { align: "right" });
    doc.text(formatoMoneda(montoDescuento), 196, baseY + 7, {
      align: "right",
    });
    doc.text(formatoMoneda(montoIva), 196, baseY + 14, {
      align: "right",
    });

    doc.setFont("helvetica", "bold");
    doc.text(formatoMoneda(total), 196, baseY + 20, { align: "right" });

    // Firmas
    doc.setDrawColor(verdeOscuro);
    doc.setLineWidth(0.5);
    doc.rect(10, 240, 95, 40);
    doc.rect(105, 240, 95, 40);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text("Firma", 57.5, 260, { align: "center" });
    doc.text("Firma del cliente", 152.5, 260, { align: "center" });

    doc.save(`presupuesto-${cliente.nombre || "cliente"}.pdf`);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-full overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Presupuestos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generación momentánea de presupuestos en PDF
          </p>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Número de presupuesto"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />

            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Validez en días"
              value={validez}
              onChange={(e) => setValidez(e.target.value)}
            />
          </div>

         


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3 border rounded-xl p-4">
              <h2 className="font-semibold text-card-foreground">
                Datos de la empresa
              </h2>

              <Input placeholder="Empresa" value={empresa.nombre} onChange={(e) => actualizarDato("empresa", "nombre", e.target.value)} />
              <Input placeholder="Dirección" value={empresa.direccion} onChange={(e) => actualizarDato("empresa", "direccion", e.target.value)} />
              <Input placeholder="CUIT" value={empresa.cuit} onChange={(e) => actualizarDato("empresa", "cuit", e.target.value)} />
              <Input placeholder="Teléfono" value={empresa.telefono} onChange={(e) => actualizarDato("empresa", "telefono", e.target.value)} />
              <Input placeholder="Email" value={empresa.email} onChange={(e) => actualizarDato("empresa", "email", e.target.value)} />
            </div>

            <div className="space-y-3 border rounded-xl p-4">
              <h2 className="font-semibold text-card-foreground">
                Datos del cliente
              </h2>

              <Input placeholder="Cliente" value={cliente.nombre} onChange={(e) => actualizarDato("cliente", "nombre", e.target.value)} />
              <Input placeholder="Dirección" value={cliente.direccion} onChange={(e) => actualizarDato("cliente", "direccion", e.target.value)} />
              <Input placeholder="CUIT / DNI" value={cliente.cuit} onChange={(e) => actualizarDato("cliente", "cuit", e.target.value)} />
              <Input placeholder="Teléfono" value={cliente.telefono} onChange={(e) => actualizarDato("cliente", "telefono", e.target.value)} />
              <Input placeholder="Email" value={cliente.email} onChange={(e) => actualizarDato("cliente", "email", e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 border rounded-xl p-4">
            <h2 className="font-semibold text-card-foreground">
              Ítems del presupuesto
            </h2>

            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <Input
                  className="md:col-span-5"
                  placeholder="Descripción"
                  value={item.descripcion}
                  onChange={(e) =>
                    actualizarItem(i, "descripcion", e.target.value)
                  }
                />

                <Input
                  className="md:col-span-2"
                  type="number"
                  min="1"
                  placeholder="Unidades"
                  value={item.unidades}
                  onChange={(e) =>
                    actualizarItem(i, "unidades", e.target.value)
                  }
                />

                <Input
                  className="md:col-span-2"
                  type="number"
                  min="0"
                  placeholder="Precio"
                  value={item.precio}
                  onChange={(e) =>
                    actualizarItem(i, "precio", e.target.value)
                  }
                />

                <div className="md:col-span-3 flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">
                    {formatoMoneda(item.unidades * item.precio)}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => eliminarItem(i)}
                    disabled={items.length === 1}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" onClick={agregarItem}>
              Agregar ítem
            </Button>
          </div>

          <div className="space-y-3 border rounded-xl p-4 max-w-md ml-auto">
            <Input
              type="number"
              placeholder="Descuento"
              value={descuento}
              onChange={(e) => setDescuento(Number(e.target.value))}
            />

            <Input
              type="number"
              placeholder="IVA %"
              value={iva}
              onChange={(e) => setIva(Number(e.target.value))}
            />

            <p className="text-sm">Subtotal: {formatoMoneda(subtotal)}</p>
            <p className="text-sm">
              Descuento: {formatoMoneda(montoDescuento)}
            </p>
            <p className="text-sm">IVA: {formatoMoneda(montoIva)}</p>

            <p className="font-bold text-lg">
              Total presupuesto: {formatoMoneda(total)}
            </p>

            <Button onClick={generarPDF} className="w-full">
              Generar PDF
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}