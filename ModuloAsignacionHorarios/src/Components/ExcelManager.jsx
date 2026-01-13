import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

/* =========================
El css de los componentes esta incrustado en los mismos por simplicidad.
Pero se puede cambiar a index.css si es que gustan
======================= */

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
  const [vista, setVista] = useState("tabla"); // tabla | horario | profesores | grupos
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
     COMPONENTE HORARIO
  ==========================*/
  const Calendario = ({ titulo, bloques }) => (
    <div style={{ marginBottom: 40 }}>
      <h2>{titulo}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {DIAS.map(d => (
          <div key={d} style={{
            background: DIA_COLOR[d],
            color: 'white',
            padding: 12,
            borderRadius: 12
          }}>
            <strong>{d}</strong>
            {bloques
              .filter(b => b.dia === d)
              .sort((a, b) => a.inicio - b.inicio)
              .map((b, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  padding: 8,
                  marginTop: 6
                }}>
                  <strong>{formatHora(b.inicio)} – {formatHora(b.fin)}</strong><br />
                  {b.materia}<br />
                  {b.aula}<br />
                  {b.profesor || b.grupo}
                </div>
              ))}
          </div>
        ))}
      </div>
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

      {/* TABLA */}
      {vista === "tabla" && datos.length > 0 && (
        <div style={{ marginTop: 20, overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <thead>
              <tr>
                {columnas.map(c => (
                  <th
                    key={c}
                    onClick={() => requestSort(c)}
                    style={{ padding: 12, cursor: 'pointer', background: '#1f2937', color: 'white' }}
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
                <tr key={i}>
                  {columnas.map(c => (
                    <td key={c} style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>
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

      {/* HORARIO GENERAL */}
      {vista === "horario" && (
        <Calendario titulo="Horario General" bloques={datos.flatMap(m => m.AulaAsignada || [])} />
      )}

      {/* PROFESORES */}
      {vista === "profesores" &&
        Object.entries(calendarioProfesores).map(([p, b]) =>
          <Calendario key={p} titulo={`Profesor: ${p}`} bloques={b} />
        )
      }

      {/* GRUPOS */}
      {vista === "grupos" &&
        Object.entries(calendarioGrupos).map(([g, b]) =>
          <Calendario key={g} titulo={`Grupo: ${g}`} bloques={b} />
        )
      }

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ExcelManager;
