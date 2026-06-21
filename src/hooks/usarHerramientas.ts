import { useState } from 'react';
import { apiHerramientas } from '../servicios/apiHerramientas';

// Definimos el contrato para la información del Modal
export interface DatosModal {
  titulo: string;
  contenido: any; 
}

export const usarHerramientas = () => {
  const [cargandoTool, setCargandoTool] = useState(false);
  const [datosModal, setDatosModal] = useState<DatosModal | null>(null);

  const ejecutar = async (nombre: string, accion: () => Promise<any>) => {
    setCargandoTool(true);
    try {
      const resultado = await accion();
      
      if (resultado instanceof Blob) {
        const url = window.URL.createObjectURL(resultado);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exportacion_${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // En lugar de alert(), abrimos el Modal con los datos
        setDatosModal({ titulo: nombre, contenido: resultado });
      }
    } catch (error) {
      console.error(`Error al ejecutar ${nombre}:`, error);
      setDatosModal({ 
        titulo: `Error: ${nombre}`, 
        contenido: { error: 'Hubo un problema de comunicación con el servidor al ejecutar esta herramienta.' } 
      });
    } finally {
      setCargandoTool(false);
    }
  };

  const cerrarModal = () => setDatosModal(null);

  return {
    cargandoTool,
    datosModal,
    cerrarModal,
    diagnostico: () => ejecutar('Diagnóstico', apiHerramientas.diagnostico),
    reportes: () => ejecutar('Listar Reportes', apiHerramientas.reportes),
    limpiarCache: () => ejecutar('Limpiar Caché', apiHerramientas.limpiarCache),
    exportarCsv: () => ejecutar('Exportar CSV', apiHerramientas.exportarCsv),
    metricasResumen: () => ejecutar('Métricas Rápidas', apiHerramientas.metricasResumen),
  };
};