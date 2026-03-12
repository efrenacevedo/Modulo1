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

const normalizarHora = (h) => {
  let hora = Number(h);

  // Si es 1,2,3,4,5,6 asumimos que es de la tarde
  if (hora >= 1 && hora <= 6) {
    hora += 12;
  }

  return hora;
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

  // =========================
// OR-TOOLS (BACKEND)
// =========================
const generarConORTools = async () => {
  if (!Array.isArray(datos) || datos.length === 0) {
    setAlertMessage("Primero debes cargar un archivo Excel");
    setAlertType("error");
    setOpenAlert(true);
    return;
  }

  try {
    setLoading(true);

    // 🔍 Debug: ver exactamente qué se envía al backend
    console.log("JSON enviado a OR-Tools:", datos);

    const response = await fetch("http://127.0.0.1:8000/generar-horarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    const data = await response.json();

    // 🔍 Debug: ver exactamente qué regresa el backend
    console.log("Respuesta OR-Tools:", data);

    // 🛡️ Validación obligatoria de la respuesta
    if (!Array.isArray(data)) {
      console.error("Respuesta inválida del backend:", data);

      setAlertMessage(
        data?.error ||
        "Error al generar horarios (respuesta inválida del servidor)"
      );
      setAlertType("error");
      setOpenAlert(true);
      return;
    }

    // 🔥 Aquí ya vienen las aulas calculadas por OR-Tools
    setDatos(data);

    setAlertMessage("Horarios generados correctamente con OR-Tools");
    setAlertType("success");
    setOpenAlert(true);

  } catch (error) {
    console.error("Error al conectar con OR-Tools:", error);

    setAlertMessage("Error al conectar con el servidor de OR-Tools");
    setAlertType("error");
    setOpenAlert(true);
  } finally {
    setLoading(false);
  }
};



  /*
    Alertas
  */

    const [openAlert, setOpenAlert] = useState(false);
    const [alertType, setAlertType] = useState("info");
    const [alertMessage, setAlertMessage] = useState("");


  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const tableColors = {
    bg: isDark ? '#111827' : '#ffffff',
    bgAlt: isDark ? '#1f2937' : '#f9fafb',
    text: isDark ? '#f9fafb' : '#111827',
    border: isDark ? '#374151' : '#e5e7eb',
    card: isDark ? '#1f2937' : '#eef2ff'
  };

  const tableTheme = {
  headerBg: isDark ? '#1f2937' : '#f1f5f9',
  headerText: isDark ? '#f9fafb' : '#111827',
  rowBg: isDark ? '#111827' : '#ffffff',
  rowAltBg: isDark ? '#1f2937' : '#f9fafb',
  border: isDark ? '#374151' : '#e5e7eb',
  text: isDark ? '#e5e7eb' : '#111827'
};

const procesarExcel = (filas) => {

  const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
  let indiceDia = 0;

  const materias = filas.map((fila) => {

    const horas = parseInt(fila["Horas"]) || 2;

    const inicio = 7;
    const fin = inicio + horas;

    const materia = {
      Semestre: parseInt(fila["Semestre"]) || 0,
      Grupo: fila["Grupo"] || "",
      NombreAsignatura: fila["Nombre de la asignatura"] || "",
      NombreProfesor: fila["Nombre del profesor"] || "",
      Turno: fila["Turno"] || "",
      PeriodoEscolar: fila["Periodo Escolar"] || "",

      Horario: [
        {
          dia: dias[indiceDia % dias.length],
          inicio: inicio,
          fin: fin
        }
      ]
    };

    indiceDia++;

    return materia;
  });

  return materias;
};

  /* =========================
     CARGA EXCEL
  ==========================*/
 const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setLoading(true);

  const reader = new FileReader();

  reader.onload = (event) => {
    try {

      // Leer archivo Excel
      const workbook = XLSX.read(event.target.result, { type: 'array' });

      // Primera hoja
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Convertir Excel a JSON
      const filas = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      console.log("Filas leídas del Excel:", filas);

      // Procesar filas para generar horarios
      const data = procesarExcel(filas);

      console.log("Datos procesados:", data);

      // Guardar datos en el estado
      setDatos(data);

    } catch (error) {

      console.error("Error al procesar el Excel:", error);

      setAlertMessage("Error al procesar el archivo Excel");
      setAlertType("error");
      setOpenAlert(true);

    } finally {
      setLoading(false);
    }
  };

  reader.readAsArrayBuffer(file);
};

  /* =========================
   ASIGNAR AULAS (CORREGIDO POR GRUPO Y SEMESTRE)
=========================*/
const asignarAulas = () => {
  if (datos.length === 0) {
    setAlertMessage("Primero debes cargar un archivo Excel");
    setAlertType("error");
    setOpenAlert(true);
    return;
  }

  try {
    /*
      Estructura:
      edificio[semestre][grupo][dia][aula] = [{inicio, fin}]
    */
    const edificio = {};

    const resultado = datos.map(materia => {
      const semestre = materia.Semestre;
      const grupo = materia.Grupo;

      // Crear estructura por semestre
      if (!edificio[semestre]) edificio[semestre] = {};

      // Crear estructura por grupo
      if (!edificio[semestre][grupo]) {
        edificio[semestre][grupo] = {};
        DIAS.forEach(d => {
          edificio[semestre][grupo][d] = {};
        });
      }

      const asignaciones = [];

      materia.Horario.forEach(h => {
        for (let aula of AULAS) {
          if (!edificio[semestre][grupo][h.dia][aula]) {
            edificio[semestre][grupo][h.dia][aula] = [];
          }

          const choque = edificio[semestre][grupo][h.dia][aula].some(b =>
            !(h.fin <= b.inicio || h.inicio >= b.fin)
          );

          if (!choque) {
            edificio[semestre][grupo][h.dia][aula].push(h);
            asignaciones.push({ ...h, aula });
            break;
          }
        }
      });

      return { ...materia, AulaAsignada: asignaciones };
    });

    setDatos(resultado);

    setAlertMessage("Aulas asignadas correctamente por grupo y semestre");
    setAlertType("success");
    setOpenAlert(true);

  } catch (e) {
    console.error(e);
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
        dia: h.dia,
        inicio: h.inicio,
        fin: h.fin,
        aula: h.aula,
        materia: m.NombreAsignatura,
        profesor: m.NombreProfesor,
        semestre: m.Semestre,
        grupo: m.Grupo
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

  // ocultar botones PDF
  const botones = input.querySelectorAll('.no-pdf');
  botones.forEach(btn => btn.style.display = 'none');

  html2canvas(input, {
    scale: 3,
    useCORS: true
  }).then((canvas) => {

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    /* ===============================
       BARRA SUPERIOR
    =============================== */
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 55, 'F');

    /* ===============================
       TITULO
    =============================== */
    pdf.setTextColor(255,255,255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text('HORARIO ESCOLAR', pageWidth / 2, 35, { align: 'center' });

    /* ===============================
       DATOS
    =============================== */
    pdf.setTextColor(0,0,0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');

    pdf.text(`Grupo: ${grupo}`, 50, 85);
    pdf.text(`Semestre: ${semestre}`, pageWidth - 170, 85);

    // línea separadora
    pdf.setDrawColor(180);
    pdf.line(50, 95, pageWidth - 50, 95);

    /* ===============================
       IMAGEN MÁS GRANDE
    =============================== */
    const maxWidth = pageWidth - 100;
    const maxHeight = pageHeight - 220;

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
       FIRMA ABAJO
    =============================== */
    const firmaY = pageHeight - 70;

    pdf.setDrawColor(120);
    pdf.line(pageWidth / 2 - 140, firmaY, pageWidth / 2 + 140, firmaY);

    pdf.setFontSize(11);
    pdf.text('Nombre y firma', pageWidth / 2, firmaY + 18, {
      align: 'center'
    });

    /* ===============================
       FECHA
    =============================== */
    pdf.setFontSize(10);
    pdf.text(
      `Generado el ${new Date().toLocaleDateString()}`,
      pageWidth - 50,
      pageHeight - 20,
      { align: 'right' }
    );

    pdf.save(`${titulo}.pdf`);

    // restaurar botones
    botones.forEach(btn => btn.style.display = 'inline-block');

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

      <div className="calendar-grid">
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
    <button onClick={asignarAulas}>Asignar aulas (local)</button>

    {/* 🔥 NUEVO BOTÓN */}
    <button onClick={generarConORTools}>
      Generar horarios con OR-Tools
    </button>

    <button onClick={() => setVista("tabla")}>Tabla</button>
    <button onClick={() => setVista("horario")}>Horario general</button>
    <button onClick={() => setVista("profesores")}>Profesores</button>
    <button onClick={() => setVista("grupos")}>Grupos</button>
  </div>
)}

{vista === "tabla" && datos.length > 0 && (
  <div
    className="table-wrapper"
    style={{
      marginTop: 20,
      overflowX: 'auto',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
    }}
  >
   <table
  className="responsive-table"
  style={{
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    background: tableTheme.rowBg,
    color: tableTheme.text
  }}
>


          <thead>
  <tr>
    {columnas.map(c => (
  <th
  key={c}
  onClick={() => requestSort(c)}
  style={{
    padding: '12px 10px',
    background: tableTheme.headerBg,
    color: tableTheme.headerText,
    borderBottom: `2px solid ${tableTheme.border}`,
    textAlign: 'left',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  }}
>

        {c}
        {sortConfig?.key === c &&
          (sortConfig.direction === 'asc'
            ? <ArrowUp size={14}/>
            : <ArrowDown size={14}/>)}
      </th>
    ))}
  </tr>
</thead>
    <tbody>
  {datosOrdenados.map((fila, i) => (
   <tr
  key={i}
  style={{
    borderBottom: `1px solid ${tableTheme.border}`,
    background: i % 2 === 0
      ? tableTheme.rowBg
      : tableTheme.rowAltBg,
    color: tableTheme.text
  }}
>
      {columnas.map(c => (
       <td
  key={c}
  data-label={c}
  style={{
    padding: '10px',
    verticalAlign: 'top',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    color: tableTheme.text
  }}
>

          {c === "AulaAsignada" && Array.isArray(fila[c])
            ? fila[c].map((b, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: 6,
                    padding: 6,
                    borderRadius: 6,
                    background: tableColors.card,
                    fontSize: 13,
                    color: tableColors.text
                  }}
                >
                  <strong>{b.dia}</strong><br />
                  {b.aula}<br />
                  {formatHora(b.inicio)} – {formatHora(b.fin)}
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
    bloques={datos.flatMap(m =>
      (m.AulaAsignada || []).map(h => ({
        ...h,
        materia: m.NombreAsignatura,
        profesor: m.NombreProfesor
      }))
    )}
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

  /* =======================
     RESPONSIVE GLOBAL
  ======================= */

  .container {
    padding: 40px;
  }

  /* Botones */
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* Tabla */
  .table-wrapper {
    overflow-x: auto;
  }

  /* Calendario */
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: start;
  }

  /* =======================
     TABLET (≤ 1024px)
  ======================= */
  @media (max-width: 1024px) {
    .calendar-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* =======================
     MOBILE (≤ 768px)
  ======================= */
  @media (max-width: 768px) {

    .container {
      padding: 20px;
    }

    h1 {
      font-size: 22px;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }

    .responsive-table {
      font-size: 12px;
    }

    th, td {
      padding: 8px !important;
    }

    .calendar-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
  .responsive-table thead {
    display: none;
  }

  .responsive-table tr {
  display: block;
  margin-bottom: 16px;
  border: 1px solid var(--table-border);
  border-radius: 12px;
  padding: 10px;
  background: var(--table-row-bg);
  color: var(--table-text);
}


  .responsive-table td {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .responsive-table td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #6b7280;
  }
}

  /* =======================
     EXTRA SMALL (≤ 480px)
  ======================= */
  @media (max-width: 480px) {

    .action-buttons {
      grid-template-columns: 1fr;
    }

    h2 {
      font-size: 18px;
    }

    button {
      width: 100%;
    }
  }
`}</style>


    </div>
  );
};

export default ExcelManager;