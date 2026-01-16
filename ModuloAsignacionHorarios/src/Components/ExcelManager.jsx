import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ModalAlert from "./Generic/ModalAlert"; 


/* =========================
   CONSTANTES
=========================*/
const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
const AULAS = Array.from({ length: 10 }, (_, i) => `Aula ${i + 1}`);

const DIA_COLOR = {
  Lunes: "#3b82f6",
  Martes: "#10b981",
  Miercoles: "#f59e0b",
  Jueves: "#8b5cf6",
  Viernes: "#ef4444"
};

/* =========================
   UTILIDADES
=========================*/
const formatHora = (h) => {
  const periodo = h >= 12 ? "pm" : "am";
  const hora12 = h % 12 === 0 ? 12 : h % 12;
  return `${hora12}:00 ${periodo}`;
};

const compareValues = (a, b) => {
  if (!isNaN(a) && !isNaN(b)) return Number(a) - Number(b);
  return String(a).localeCompare(String(b), 'es', { sensitivity: 'base' });
};

// 🔥 Generar variaciones de color
const shadeColor = (color, percent) => {
  let num = parseInt(color.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;

  return "#" + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
};

/* =========================
   COMPONENTE PRINCIPAL
=========================*/
const ExcelManager = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vista, setVista] = useState("tabla");
  const [sortConfig, setSortConfig] = useState(null);

  /*
    Alertas
  */

    const [openAlert, setOpenAlert] = useState(false);
    const [alertType, setAlertType] = useState("info");
    const [alertMessage, setAlertMessage] = useState("");


  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  /* =========================
     CARGA EXCEL
  ==========================*/
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const data = XLSX.utils.sheet_to_json(sheet, { defval: '' }).map(row => {
        const clean = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k.trim(), v])
        );

        const Horario = [];
        DIAS.forEach(d => {
          if (clean[d]) {
            const [inicio, fin] = clean[d].split('-').map(Number);
            if (!isNaN(inicio) && !isNaN(fin)) {
              Horario.push({ dia: d, inicio, fin });
            }
          }
        });

        return { ...clean, Horario };
      });

      setDatos(data);
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  /* =========================
     ASIGNAR AULAS
  ==========================*/
  const asignarAulas = () => {
  if (datos.length === 0) {
    setAlertMessage("Primero debes cargar un archivo Excel");
    setAlertType("error");
    setOpenAlert(true);
    return;
  }

  try {
    const edificio = {};
    DIAS.forEach(d => edificio[d] = {});

    const ordenadas = [...datos].sort((a, b) =>
      Math.min(...a.Horario.map(h => h.inicio)) -
      Math.min(...b.Horario.map(h => h.inicio))
    );

    const resultado = ordenadas.map(materia => {
      const asignaciones = [];

      materia.Horario.forEach(h => {
        for (let aula of AULAS) {
          if (!edificio[h.dia][aula]) edificio[h.dia][aula] = [];

          const choque = edificio[h.dia][aula].some(b =>
            !(h.fin <= b.inicio || h.inicio >= b.fin)
          );

          if (!choque) {
            edificio[h.dia][aula].push(h);
            asignaciones.push({ ...h, aula });
            break;
          }
        }
      });

      return { ...materia, AulaAsignada: asignaciones };
    });

    setDatos(resultado);

    // ✅ ALERT SUCCESS
    setAlertMessage("Aulas asignadas correctamente");
    setAlertType("success");
    setOpenAlert(true);

  } catch (e) {
    // ❌ ALERT ERROR
    setAlertMessage("Ocurrió un error al asignar las aulas");
    setAlertType("error");
    setOpenAlert(true);
  }
};

  /* =========================
     ORDENAMIENTO
  ==========================*/
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const datosOrdenados = useMemo(() => {
    if (!sortConfig) return datos;
    return [...datos].sort((a, b) => {
      const res = compareValues(a[sortConfig.key], b[sortConfig.key]);
      return sortConfig.direction === 'asc' ? res : -res;
    });
  }, [datos, sortConfig]);

  const columnas = useMemo(() =>
    datos.length ? Object.keys(datos[0]).filter(k => k !== "Horario") : []
  , [datos]);

  /* =========================
     CALENDARIOS
  ==========================*/
  const calendarioProfesores = useMemo(() => {
    const map = {};
    datos.forEach(m => {
      (m.AulaAsignada || []).forEach(h => {
        const prof = m["Nombre del profesor"];
        if (!map[prof]) map[prof] = [];
        map[prof].push({
          ...h,
          materia: m["Nombre de la asignatura"],
          grupo: `Sem ${m.Semestre} G${m.Grupo}`
        });
      });
    });
    return map;
  }, [datos]);

  const calendarioGrupos = useMemo(() => {
    const map = {};
    datos.forEach(m => {
      const key = `Sem ${m.Semestre} Grupo ${m.Grupo}`;
      if (!map[key]) map[key] = [];
      (m.AulaAsignada || []).forEach(h => {
        map[key].push({
          ...h,
          materia: m["Nombre de la asignatura"],
          profesor: m["Nombre del profesor"]
        });
      });
    });
    return map;
  }, [datos]);

  /* =========================
     DESCARGA PDF
  ==========================*/
const exportPDF = (titulo, idElemento, grupo, semestre) => {
  const input = document.getElementById(idElemento);
  if (!input) return;

  input.classList.add('exportando-pdf');

  html2canvas(input, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    /* ===============================
       ENCABEZADO
    =============================== */

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text('HORARIO ESCOLAR', pageWidth / 2, 40, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Grupo: ${grupo}`, 40, 75);
    pdf.text(`Semestre: ${semestre}`, pageWidth - 200, 75);

    // Línea separadora
    pdf.setLineWidth(1);
    pdf.line(40, 90, pageWidth - 40, 90);

    /* ===============================
       IMAGEN DEL HORARIO
    =============================== */

    const maxWidth = pageWidth - 80;
    const maxHeight = pageHeight - 150;

    const scale = Math.min(
      maxWidth / canvas.width,
      maxHeight / canvas.height
    );

    const imgWidth = canvas.width * scale;
    const imgHeight = canvas.height * scale;

    const x = (pageWidth - imgWidth) / 2;
    const y = 110;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

    /* ===============================
       PIE DE PÁGINA
    =============================== */

    pdf.setFontSize(10);
    pdf.text(
      `Generado el ${new Date().toLocaleDateString()}`,
      pageWidth - 40,
      pageHeight - 20,
      { align: 'right' }
    );

    /* ===============================
   FIRMA DEL RESPONSABLE
=============================== */

const firmaY = pageHeight - 60;

const firmaOffsetX = -120; // 👈 ajusta este valor a tu gusto
const firmaCenterX = pageWidth / 2 + firmaOffsetX;

pdf.setFontSize(12);
pdf.setFont('helvetica', 'normal');

// Texto superior
pdf.text(
  'Firma del responsable',
  firmaCenterX,
  firmaY - 20,
  { align: 'center' }
);

// Línea de firma
pdf.setLineWidth(1);
pdf.line(
  firmaCenterX - 150,
  firmaY,
  firmaCenterX + 150,
  firmaY
);

// Texto inferior
pdf.setFontSize(10);
pdf.text(
  'Nombre y firma',
  firmaCenterX,
  firmaY + 15,
  { align: 'center' }
);


    pdf.save(`${titulo}.pdf`);

    input.classList.remove('exportando-pdf');
  });
};


  // Descargar todos los PDFs de profesores
  const exportAllProfesores = () => {
    Object.entries(calendarioProfesores).forEach(([p, _]) => {
      exportPDF(`Profesor-${p.replace(/\s+/g,'-')}`, `profesor-${p.replace(/\s+/g,'-')}`);
    });
  };

  // Descargar todos los PDFs de grupos
  const exportAllGrupos = () => {
    Object.entries(calendarioGrupos).forEach(([g, _]) => {
      exportPDF(`Grupo-${g.replace(/\s+/g,'-')}`, `grupo-${g.replace(/\s+/g,'-')}`);
    });
  };

  /* =========================
     COMPONENTE CALENDARIO
  ==========================*/
  const Calendario = ({ titulo, bloques, id, grupo, semestre }) => (
    <div id={id} style={{ marginBottom: 40 }}>
      <h2>{titulo}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, alignItems: 'start' }}>
        {DIAS.map(d => {
          const bloquesDia = bloques
            .filter(b => b.dia === d)
            .sort((a, b) => a.inicio - b.inicio);

          return (
            <div key={d} style={{
              background: isDark ? '#111827' : '#f3f4f6',
              padding: 12,
              borderRadius: 12
            }}>
              <strong style={{ color: DIA_COLOR[d] }}>{d}</strong>

              {bloquesDia.map((b, i) => {
                const intensidad = -20 + (i * (40 / Math.max(bloquesDia.length, 1)));
                const colorBloque = shadeColor(DIA_COLOR[d], intensidad);

                return (
                  <div key={i} style={{
                    background: colorBloque,
                    color: 'white',
                    borderRadius: 8,
                    padding: 8,
                    marginTop: 6
                  }}>
                    <strong>{formatHora(b.inicio)} – {formatHora(b.fin)}</strong><br />
                    {b.materia}<br />
                    {b.aula}<br />
                    {b.profesor || b.grupo}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <button
  className="no-pdf"
  onClick={() => exportPDF(titulo, id, grupo, semestre)}
>
  Descargar PDF
</button>

    </div>
  );

  /* =========================
     RENDER
  ==========================*/
  return (
    <div style={{ padding: 40, maxWidth: 1500, margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Asignación de Aulas</h1>

      <div style={{ border: '2px dashed #ccc', padding: 30, textAlign: 'center' }}>
        {!loading && (
          <label>
            <Upload size={40} />
            <p>Subir Excel</p>
            <input type="file" hidden onChange={handleFileUpload} />
          </label>
        )}
        {loading && <Loader2 className="spin" />}
      </div>

      {datos.length > 0 && (
        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={asignarAulas}>Asignar aulas</button>
          <button onClick={() => setVista("tabla")}>Tabla</button>
          <button onClick={() => setVista("horario")}>Horario general</button>
          <button onClick={() => setVista("profesores")}>Profesores</button>
          <button onClick={() => setVista("grupos")}>Grupos</button>
        </div>
      )}

      {vista === "tabla" && datos.length > 0 && (
        <div style={{ marginTop: 20, overflowX: 'auto' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                {columnas.map(c => (
                  <th key={c} onClick={() => requestSort(c)}>
                    {c}
                    {sortConfig?.key === c &&
                      (sortConfig.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datosOrdenados.map((fila, i) => (
                <tr key={i}>
                  {columnas.map(c => (
                    <td key={c}>
                      {c === "AulaAsignada" && Array.isArray(fila[c])
                        ? fila[c].map((b, idx) => (
                            <div key={idx}>
                              {b.dia} {b.aula} {formatHora(b.inicio)}–{formatHora(b.fin)}
                            </div>
                          ))
                        : fila[c]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openAlert && (
  <ModalAlert
    mensaje={alertMessage}
    type={alertType}
    onClose={() => setOpenAlert(false)}
  />
)}


      {vista === "horario" &&
        <Calendario
          id="horario-general"
          titulo="Horario General"
          bloques={datos.flatMap(m => m.AulaAsignada || [])}
        />
      }

      {vista === "profesores" && (
        <>
          <button onClick={exportAllProfesores} >Descargar todos PDFs Profesores</button>
          {Object.entries(calendarioProfesores).map(([p, b]) =>
            <Calendario
              key={p}
              id={`profesor-${p.replace(/\s+/g, '-')}`}
              titulo={`Profesor: ${p}`}
              bloques={b}
            />
          )}
        </>
      )}

      {vista === "grupos" && (
        <>

          <button onClick={exportAllGrupos} >Descargar todos PDFs Grupos</button>
          {Object.entries(calendarioGrupos).map(([g, b]) => {
  const match = g.match(/Sem\s*(\d+)\s*Grupo\s*(.+)/);

  const semestre = match ? match[1] : '';
  const grupo = match ? match[2] : '';

  return (
    <Calendario
      key={g}
      id={`grupo-${g.replace(/\s+/g, '-')}`}
      titulo={`Grupo ${grupo} - Semestre ${semestre}`}
      bloques={b}
      grupo={grupo}
      semestre={semestre}
    />
  );
})}

        </>
      )}

      <style>{`
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* 👇 ESTO ES LO NUEVO */
  .no-pdf {
    display: block;
  }

  .exportando-pdf .no-pdf {
    display: none;
  }
`}</style>

    </div>
  );
};

export default ExcelManager;