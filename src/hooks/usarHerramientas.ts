import { useState } from 'react';
import { apiHerramientas } from '../servicios/apiHerramientas';
import { apiLocal } from '../servicios/apiLocal'; // <-- ¡IMPORTANTE: Agregamos esta importación!

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

  const manejarExportarCsv = async () => {
    setCargandoTool(true); // Encendemos el loader
    try {
      // Llamamos a la función que creaste en apiLocal (que fuerza la descarga)
      await apiLocal.descargarCSV();
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