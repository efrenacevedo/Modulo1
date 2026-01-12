import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelUploader = () => {
  const [datos, setDatos] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const bstr = event.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });

      // Obtenemos la primera hoja de trabajo
      const workSheetName = workbook.SheetNames[0];
      const workSheet = workbook.Sheets[workSheetName];

      // Convertimos a JSON (formato de arreglo de objetos)
      const fileData = XLSX.utils.sheet_to_json(workSheet);
      
      setDatos(fileData);
      console.log("Datos extraídos:", fileData);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Asignación de Aulas - Subir Excel</h2>
      
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileUpload} 
        style={{ marginBottom: '20px' }}
      />

      {datos.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                {Object.keys(datos[0]).map((key) => (
                  <th key={key} style={{ padding: '10px' }}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.map((fila, index) => (
                <tr key={index}>
                  {Object.values(fila).map((valor, i) => (
                    <td key={i} style={{ padding: '10px' }}>{valor}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;