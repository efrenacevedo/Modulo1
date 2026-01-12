import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

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

/* =========================
   COMPONENTE
=========================*/
const ExcelManager = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vistaHorario, setVistaHorario] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);

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
     VISTA HORARIO
  ==========================*/
  const HorarioSemanal = () => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(5, 1fr)`, gap: 16 }}>
      {DIAS.map(dia => (
        <div key={dia} style={{
          background: DIA_COLOR[dia],
          borderRadius: 12,
          padding: 12,
          color: 'white'
        }}>
          <h3 style={{ textAlign: 'center' }}>{dia}</h3>
          {datosOrdenados.flatMap(m =>
            (m.AulaAsignada || []).filter(a => a.dia === dia).map((a, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: 8,
                marginBottom: 6
              }}>
                <strong>{a.aula}</strong><br />
                {formatHora(a.inicio)} – {formatHora(a.fin)}<br />
                <small>{m["Nombre de la asignatura"]}</small>
              </div>
            ))
          )}
        </div>
      ))}
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
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={asignarAulas}>Asignar aulas</button>
          <button onClick={() => setVistaHorario(!vistaHorario)}>
            {vistaHorario ? "Ver tabla" : "Ver horario"}
          </button>
        </div>
      )}

      {datos.length > 0 && (
        <div style={{ marginTop: 20, overflowX: 'auto' }}>
          {vistaHorario ? (
            <HorarioSemanal />
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              background: isDark ? '#111827' : 'white',
              borderRadius: 12,
              overflow: 'hidden'
            }}>
              <thead>
                <tr>
                  {columnas.map(c => (
                    <th
                      key={c}
                      onClick={() => requestSort(c)}
                      style={{
                        padding: 12,
                        cursor: 'pointer',
                        background: '#1f2937',
                        color: 'white',
                        position: 'sticky',
                        top: 0
                      }}
                    >
                      {c}
                      {sortConfig?.key === c &&
                        (sortConfig.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datosOrdenados.map((fila, i) => (
                  <tr key={i} style={{ transition: 'background .2s' }}>
                    {columnas.map(c => (
                      <td key={c} style={{
                        padding: 10,
                        borderBottom: '1px solid #e5e7eb',
                        verticalAlign: 'top'
                      }}>
                        {c === "AulaAsignada" && Array.isArray(fila[c])
                          ? DIAS.map(d => {
                              const bloques = fila[c].filter(a => a.dia === d);
                              if (!bloques.length) return null;
                              return (
                                <div key={d}>
                                  <strong>{d}</strong>
                                  {bloques.map((b, idx) => (
                                    <div key={idx}>
                                      {b.aula} {formatHora(b.inicio)} – {formatHora(b.fin)}
                                    </div>
                                  ))}
                                </div>
                              );
                            })
                          : fila[c]
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ExcelManager;
