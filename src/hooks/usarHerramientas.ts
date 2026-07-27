import { useState } from 'react';
import { apiHerramientas } from '../servicios/apiHerramientas';

// Definimos el contrato para la información del Modal
export interface DatosModal {
  titulo: string;
  contenido: any;
  tipo: 'diagnostico' | 'preguntas' | 'default';
}

export const usarHerramientas = () => {
  const [cargandoTool, setCargandoTool] = useState(false);
  const [datosModal, setDatosModal] = useState<DatosModal | null>(null);

  // Auxiliar reusable para ejecutar acciones tipo Modal

  const ejecutar = async (nombre: string, accion: () => Promise<any>, tipo: DatosModal['tipo'] = 'default') => {
    setCargandoTool(true);
    try {
      const resultado = await accion();
      setDatosModal({ titulo: nombre, contenido: resultado, tipo });
    } catch (error: any) {
      console.error(`Error al ejecutar ${nombre}:`, error);
      setDatosModal({
        titulo: `Error: ${nombre}`,
        contenido: { error: error.message || 'Hubo un problema de comunicación con el servidor.' },
        tipo: 'default'
      });
    } finally {
      setCargandoTool(false);
    }
  };


  // 🟢 1. DESCARGA DEL REPORTE COMPLETO EN EXCEL (.xlsx)
  const manejarExportarExcel = async (asin?: string) => {
    const asinLimpio = asin?.trim();

    if (!asinLimpio) {
      setDatosModal({
        titulo: 'Exportar Excel',
        contenido: { error: 'Abre un chat o selecciona un producto para exportar sus reseñas a Excel.' },
        tipo: 'default'
      });
      return;
    }

    setCargandoTool(true);
    try {
      // Llamamos a apiHerramientas.exportarExcel() que regresa el Blob de openpyxl
      const blob: Blob = await apiHerramientas.exportarExcel(asinLimpio);

      // Si el backend envió un JSON de error en lugar del archivo binario
      if (blob.type && blob.type.includes('application/json')) {
        const textoError = await blob.text();
        const jsonError = JSON.parse(textoError);
        throw new Error(jsonError.detail || jsonError.error || 'No se pudo generar el archivo Excel.');
      }

      const urlArchivo = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = urlArchivo;
      enlace.setAttribute('download', `Reporte_Resenas_${asinLimpio.toUpperCase()}.xlsx`);

      document.body.appendChild(enlace);
      enlace.click();

      enlace.parentNode?.removeChild(enlace);
      window.URL.revokeObjectURL(urlArchivo);
    } catch (error: any) {
      console.error(`Error al exportar Excel:`, error);
      setDatosModal({
        titulo: `Error: Exportar Excel`,
        contenido: { error: error.message || 'No se pudo descargar el archivo Excel.' },
        tipo: 'default'
      });
    } finally {
      setCargandoTool(false);
    }
  };

  // 🔴 2. DESCARGA DEL RESUMEN EJECUTIVO EN PDF (.pdf) [¡AHORA ACTIVO!]
  const manejarExportarPdf = async (asin?: string) => {
    const asinLimpio = asin?.trim();

    if (!asinLimpio) {
      setDatosModal({
        titulo: 'Exportar PDF',
        contenido: { error: 'Selecciona un producto activo para generar su resumen ejecutivo en PDF.' },
        tipo: 'default'
      });
      return;
    }

    setCargandoTool(true);
    try {
      const blob: Blob = await apiHerramientas.exportarPdf(asinLimpio);

      if (blob.type && blob.type.includes('application/json')) {
        const textoError = await blob.text();
        const jsonError = JSON.parse(textoError);
        throw new Error(jsonError.detail || jsonError.error || 'No se pudo generar el documento PDF.');
      }

      const urlArchivo = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = urlArchivo;
      enlace.setAttribute('download', `Resumen_Ejecutivo_${asinLimpio.toUpperCase()}.pdf`);

      document.body.appendChild(enlace);
      enlace.click();

      enlace.parentNode?.removeChild(enlace);
      window.URL.revokeObjectURL(urlArchivo);
    } catch (error: any) {
      console.error(`Error al exportar PDF:`, error);
      setDatosModal({
        titulo: `Error: Exportar PDF`,
        contenido: { error: error.message || 'No se pudo descargar el reporte PDF.' },
        tipo: 'default'
      });
    } finally {
      setCargandoTool(false);
    }
  };

  /* ========================================================================
     HERRAMIENTAS PAUSADAS TEMPORALMENTE (SE REACTIVARÁN DESPUÉS)
     ========================================================================
  // 💡 3. PREGUNTAS SUGERIDAS PARA INYECTAR AL CHAT RAG
  const manejarPreguntasSugeridas = async (asin?: string) => {
    const asinLimpio = asin?.trim();

    if (!asinLimpio) {
      setDatosModal({
        titulo: 'Preguntas Sugeridas',
        contenido: { error: 'Abre un producto para calcular sus preguntas frecuentes.' },
        tipo: 'default'
      });
      return;
    }

    await ejecutar(
      `Preguntas Sugeridas (${asinLimpio.toUpperCase()})`,
      () => apiHerramientas.obtenerSugerenciasPreguntas(asinLimpio),
      'preguntas'
    );
  };
  ======================================================================== */

  const cerrarModal = () => setDatosModal(null);

  return {
    cargandoTool,
    datosModal,
    cerrarModal,
    exportarExcel: manejarExportarExcel,
    exportarPdf: manejarExportarPdf,
    diagnostico: () => ejecutar('Diagnóstico del Sistema', apiHerramientas.diagnostico, 'default'),
    // 🚀 Activado en el retorno
    // preguntasSugeridas: manejarPreguntasSugeridas,

  };
};