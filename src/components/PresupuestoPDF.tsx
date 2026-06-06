import React from "react";

type Props = {
  presupuesto: any;
  productos: any[];
  tipo?: "presupuesto" | "remito";
};

const formatoMoneda = (valor: number) =>
  `$ ${Number(valor || 0).toLocaleString("es-AR")}`;

export default function PresupuestoPDF({
  presupuesto,
  productos,
  tipo = "presupuesto",
}: Props) {

  const filasMinimas = 22;

  const filasVacias = Math.max(
    0,
    filasMinimas - productos.length
  );

  const totalPagar =
    Number(presupuesto.total || 0) -
    Number(presupuesto.sena || 0);

  return (
    <div
      id="presupuesto-pdf"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "white",
        color: "black",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "11px",
        padding: "0",
      }}
    >
      <div
        style={{
          border: "1.5px solid #000",
          minHeight: "297mm",
        }}
      >

        {/* LOGO */}
        <div
  style={{
    height: "27mm",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1.5px solid #000",
    gap: "4px",
  }}
>

  <img
    src="/sp-logo2.png"
    alt="SP Eventos"
    style={{
      width: "28mm",
      height: "18mm",
      objectFit: "contain",
    }}
  />

          <div
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              fontStyle: "italic",
              marginTop: "-8mm",
            }}
          >
            {tipo === "remito"
              ? "REMITO"
              : "PRESUPUESTO"}
          </div>

        </div>

        {/* DATOS CLIENTE / FECHAS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "64.1% 35.9%",
          }}
        >

          <div>

            <div
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontStyle: "italic",
                fontSize: "18px",
                background: "#e6e6e6",
                borderBottom:
                  "1.5px solid #000",
                padding: "3px 0",
              }}
            >
              DATOS CLIENTES
            </div>

            {[
              [
                "NOMBRE Y APELLIDO",
                presupuesto.cliente,
              ],

              [
                "DOMICILIO EVENTO",
                presupuesto.lugar ||
                  presupuesto.direccion,
              ],

              [
                "CELULAR",
                presupuesto.telefono,
              ],
            ].map(([label, value]) => (

              <div
                key={String(label)}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "17.2% 82.8%",
                  minHeight: "9mm",
                  borderBottom:
                    "1px solid #000",
                }}
              >

                <div
                  style={{
                    borderRight:
                      "1px solid #000",
                    fontWeight: "bold",
                    fontStyle: "italic",
                    padding: "3px",
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    padding: "3px",
                  }}
                >
                  {value || ""}
                </div>

              </div>
            ))}
          </div>

          <div
            style={{
              borderLeft:
                "1.5px solid #000",
            }}
          >

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "35% 32.5% 32.5%",
                height: "13mm",
                borderBottom:
                  "1px solid #000",
              }}
            >

              <div
                style={{
                  borderRight:
                    "1px solid #000",
                  background: "#d9d9d9",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                }}
              >
                EVENTO
              </div>

              <div
                style={{
                  borderRight:
                    "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                <div
                  style={{
                    borderBottom:
                      "1px solid #000",
                    padding: "2px",
                  }}
                >
                  FECHA
                </div>

                <div
                  style={{
                    padding: "3px",
                  }}
                >
                  {presupuesto.fecha
                    ?.split("T")[0] || ""}
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                <div
                  style={{
                    borderBottom:
                      "1px solid #000",
                    padding: "2px",
                  }}
                >
                  HORA
                </div>

                <div
                  style={{
                    padding: "3px",
                  }}
                >
                  {presupuesto.horario ||
                    ""}
                </div>
              </div>

            </div>

            {["ENVIO", "RETIRO"].map(
              (label) => (

                <div
                  key={label}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "35% 32.5% 32.5%",
                    height: "13mm",
                    borderBottom:
                      "1px solid #000",
                  }}
                >

                  <div
                    style={{
                      borderRight:
                        "1px solid #000",
                      fontWeight:
                        "bold",
                      fontStyle:
                        "italic",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      borderRight:
                        "1px solid #000",
                      textAlign:
                        "center",
                      fontWeight:
                        "bold",
                      fontStyle:
                        "italic",
                    }}
                  >
                    <div
                      style={{
                        borderBottom:
                          "1px solid #000",
                        padding: "2px",
                      }}
                    >
                      {label === "ENVIO"
                        ? "HORA"
                        : "FECHA"}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign:
                        "center",
                      fontWeight:
                        "bold",
                      fontStyle:
                        "italic",
                    }}
                  >
                    <div
                      style={{
                        borderBottom:
                          "1px solid #000",
                        padding: "2px",
                      }}
                    >
                      HORA
                    </div>
                  </div>

                </div>
              )
            )}

          </div>
        </div>

        {/* TABLA PRODUCTOS */}
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
            tableLayout: "fixed",
            fontSize: "11px",
          }}
        >

          <thead>
            <tr
              style={{
                background: "#e6e6e6",
                height: "11mm",
              }}
            >
              <th style={th("10%")}>
                CANTIDAD
              </th>

              <th
                style={th(
                  "44%",
                  "18px"
                )}
              >
                DETALLE
              </th>

              <th style={th("9%")}>
                CONTROL
                <br />
                ENVIO
              </th>

              <th style={th("9%")}>
                CONTROL
                <br />
                RETIRO
              </th>

              <th style={th("13%")}>
                PRECIO
                <br />
                UNITARIO
              </th>

              <th style={th("15%")}>
                PRECIO TOTAL
              </th>
            </tr>
          </thead>

          <tbody>

            {productos.map((p, i) => (

              <tr
                key={i}
                style={{
                  height: "6.6mm",
                }}
              >

                <td style={td("right")}>
                  {p.cantidad}
                </td>

                <td
                  style={td(
                    "left",
                    true
                  )}
                >
                  {String(
                    p.nombre || ""
                  ).toUpperCase()}
                </td>

                <td style={td()} />

                <td style={td()} />

                <td
                  style={td(
                    "right",
                    true
                  )}
                >
                  {formatoMoneda(
                    p.precio_unitario
                  )}
                </td>

                <td
                  style={td(
                    "right",
                    true
                  )}
                >
                  {formatoMoneda(
                    p.subtotal
                  )}
                </td>

              </tr>
            ))}

            {Array.from({
              length: filasVacias,
            }).map((_, i) => (

              <tr
                key={`vacia-${i}`}
                style={{
                  height: "6.6mm",
                }}
              >
                <td style={td()} />
                <td style={td()} />
                <td style={td()} />
                <td style={td()} />
                <td style={td()} />

                <td
                  style={td(
                    "right",
                    true
                  )}
                >
                  $ 0,00
                </td>

              </tr>
            ))}

          </tbody>
        </table>

        {/* TOTALES */}
        <div style={{ borderTop: "1.5px solid #000" }}>
          {[
            ["PEDIDO", presupuesto.subtotal],
            ["ENVIO/RETIRO (CARGA/DESCARGA)", presupuesto.envio],
            ["DESCUENTO", presupuesto.descuento],
            ["TOTAL PEDIDO", presupuesto.total],
          ].map(([label, value], i) => (
            <div
              key={String(label)}
              style={{
                display: "grid",
                gridTemplateColumns: "85% 15%",
                height: "7.5mm",
                borderBottom: "1px solid #000",
                background: i === 3 ? "#d9d9d9" : "#f2f2f2",
                fontWeight: "bold",
                fontStyle: "italic",
              }}
            >
              <div
                style={{
                  borderRight: "1px solid #000",
                  textAlign: "right",
                  padding: "3px 8px",
                }}
              >
                {label}
              </div>

              <div
                style={{
                  textAlign: "right",
                  padding: "3px",
                }}
              >
                {formatoMoneda(Number(value))}
              </div>

            </div>
          ))}
        </div>

        {/* ENCARGADOS / PAGO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "55% 45%",
            borderBottom: "1.5px solid #000",
          }}
        >

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "33.3% 33.3% 33.4%",
            }}
          >

            {[
              "ENCARGADO DE ENTREGA",
              "ENCARGADO DE RETIRO",
              "ENCARGADO DE COBRO",
            ].map((t) => (

              <div
                key={t}
                style={{
                  height: "27mm",
                  borderRight:
                    "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  paddingTop: "4px",
                }}
              >
                {t}
              </div>

            ))}
          </div>

          <div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "45% 55%",
                height: "7mm",
                borderBottom:
                  "1px solid #000",
              }}
            >

              <div
                style={{
                  borderRight:
                    "1px solid #000",
                  padding: "2px",
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                FECHA Y BC:
              </div>

              <div
                style={{
                  padding: "2px",
                  textAlign: "right",
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                SEÑA {formatoMoneda(presupuesto.sena)}
              </div>

            </div>

            <div
              style={{
                height: "12mm",
                borderBottom:
                  "1px solid #000",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "60% 40%",
                height: "9mm",
                borderBottom:
                  "1px solid #000",
              }}
            >

              <div
                style={{
                  borderRight:
                    "1px solid #000",
                  background: "#d9d9d9",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  fontSize: "16px",
                  textAlign: "right",
                  padding: "4px",
                }}
              >
                TOTAL A PAGAR
              </div>

              <div
                style={{
                  padding: "4px",
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                {formatoMoneda(totalPagar)}
              </div>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "45% 18% 37%",
                height: "7mm",
                borderBottom:
                  "1px solid #000",
                fontWeight: "bold",
                fontStyle: "italic",
              }}
            >

              <div
                style={{
                  borderRight:
                    "1px solid #000",
                  padding: "2px",
                }}
              >
                TRANSFERENCIA
              </div>

              <div
                style={{
                  borderRight:
                    "1px solid #000",
                }}
              />

              <div
                style={{
                  padding: "2px",
                }}
              >
                EFECTIVO
              </div>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "60% 40%",
                height: "7mm",
                fontWeight: "bold",
                fontStyle: "italic",
              }}
            >

              <div
                style={{
                  borderRight:
                    "1px solid #000",
                  padding: "2px",
                }}
              >
                FECHA Y BC:
              </div>

              <div
                style={{
                  padding: "2px",
                }}
              >
                FECHA:
              </div>

            </div>

          </div>
        </div>

        {/* ROTURAS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "10% 90%",
            height: "8mm",
            borderBottom:
              "1px solid #000",
          }}
        >

          <div
            style={{
              borderRight:
                "1px solid #000",
              fontWeight: "bold",
              fontStyle: "italic",
              padding: "3px",
            }}
          >
            ROTURAS
          </div>

          <div />

        </div>

        {/* OBSERVACIONES / FIRMAS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "55% 45%",
          }}
        >

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "19% 81%",
              minHeight: "18mm",
              borderRight:
                "1px solid #000",
            }}
          >

            <div
              style={{
                borderRight:
                  "1px solid #000",
                fontWeight: "bold",
                fontStyle: "italic",
                padding: "3px",
              }}
            >
              OBSERVA-
              <br />
              CION
            </div>

            <div
              style={{
                padding: "4px",
                fontSize: "10px",
              }}
            >
              {presupuesto.observaciones || ""}
            </div>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "50% 50%",
            }}
          >

            <div
              style={{
                borderRight:
                  "1px solid #000",
              }}
            >

              <div
                style={{
                  height: "7mm",
                  borderBottom:
                    "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  paddingTop: "2px",
                }}
              >
                FIRMA RECIBIDO
              </div>

            </div>

            <div>

              <div
                style={{
                  height: "7mm",
                  borderBottom:
                    "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  paddingTop: "2px",
                }}
              >
                FIRMA RETIRO
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

function th(
  width: string,
  fontSize = "11px"
): React.CSSProperties {

  return {
    width,
    borderRight:
      "1px solid #000",
    borderBottom:
      "1px solid #000",
    padding: "2px",
    textAlign: "center",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize,
  };
}

function td(
  align:
    | "left"
    | "right"
    | "center" = "center",
  italic = false
): React.CSSProperties {

  return {
    borderRight:
      "1px solid #000",
    borderBottom:
      "1px solid #000",
    padding: "2px 4px",
    textAlign: align,
    fontStyle:
      italic
        ? "italic"
        : "normal",
    verticalAlign: "middle",
  };
}