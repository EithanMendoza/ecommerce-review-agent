import { useState } from 'react';
import { apiHerramientas } from '../servicios/apiHerramientas';

// Definimos el contrato para la información del Modal
export interface DatosModal {
  titulo: string;
  contenido: any;
  tipo: 'diagnostico' | 'reportes' | 'metricas' | 'default'; // Agregamos 'tipo'
}

export const usarHerramientas = () => {
  const [cargandoTool, setCargandoTool] = useState(false);
  const [datosModal, setDatosModal] = useState<DatosModal | null>(null);

  // Mantenemos tu función original para las demás herramientas
  const ejecutar = async (nombre: string, accion: () => Promise<any>, tipo: DatosModal['tipo'] = 'default') => {
    setCargandoTool(true);
    try {
      const resultado = await accion();
      // Abrimos el Modal con los datos y el tipo
      setDatosModal({ titulo: nombre, contenido: resultado, tipo });
      
    } catch (error) {
      console.error(`Error al ejecutar ${nombre}:`, error);
      // CORRECCIÓN: Aquí ponemos un mensaje de error fijo, no 'resultado'
      setDatosModal({ 
        titulo: `Error: ${nombre}`, 
        contenido: { error: 'Hubo un problema de comunicación con el servidor.' },
        tipo: 'default' 
      });
    } finally {
      setCargandoTool(false);
    }
  };

  const manejarExportarCsv = async (asin?: string) => {
    // 🆕 Sin producto seleccionado no hay nada que exportar (antes esto llamaba a un
    // endpoint que ni siquiera existe en el backend: /api/herramientas/exportar-csv)
    if (!asin) {
      setDatosModal({
        titulo: 'Exportar CSV',
        contenido: { error: 'Abre un chat sobre un producto (o elige uno en "Chat nuevo") para poder exportar su CSV.' },
        tipo: 'default'
      });
      return;
    }

    setCargandoTool(true); // Encendemos el loader
    try {
      // apiHerramientas.exportarCsv(asin) pega a POST /api/metricas/exportar-csv/{asin}
      // y ya devuelve el Blob (fetchHerramienta detecta el content-type text/csv)
      const blob: Blob = await apiHerramientas.exportarCsv(asin);

      const urlArchivo = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = urlArchivo;
      enlace.setAttribute('download', `Analisis_Resenas_${asin}.csv`);

      document.body.appendChild(enlace);
      enlace.click();

      enlace.parentNode?.removeChild(enlace);
      window.URL.revokeObjectURL(urlArchivo);
    } catch (error: any) {
      console.error(`Error al exportar CSV:`, error);
      setDatosModal({ 
        titulo: `Error: Exportar CSV`, 
        contenido: { error: error.message || 'No se pudo descargar el archivo CSV.' },
        tipo: 'default'
      });
    } finally {
      setCargandoTool(false); // Apagamos el loader
    }
  };

  const cerrarModal = () => setDatosModal(null);

  return {
    cargandoTool,
    datosModal,
    cerrarModal,
    diagnostico: () => ejecutar('Diagnóstico', apiHerramientas.diagnostico, 'diagnostico'),
    reportes: () => ejecutar('Listar Reportes', apiHerramientas.reportes),
    limpiarCache: () => ejecutar('Limpiar Caché', apiHerramientas.limpiarCache),
    exportarCsv: manejarExportarCsv, 
    metricasUltima: () => ejecutar('Última Métrica de Rendimiento', apiHerramientas.metricasUltima, 'metricas'),
  };
};