import { useState, useEffect, useRef, useCallback } from 'react';

// Le decimos a TypeScript que estas propiedades existen en el objeto window del navegador
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const usarReconocimientoVoz = () => {
  const [escuchando, setEscuchando] = useState(false);
  const [soportado, setSoportado] = useState(true);
  const [textoTranscrito, setTextoTranscrito] = useState('');
  
  const reconocimientoRef = useRef<any>(null);

  useEffect(() => {
    // Verificamos si el navegador del usuario soporta la API
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setSoportado(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const reconocimiento = new SpeechRecognition();
    
    reconocimiento.continuous = false; // Se detiene cuando el usuario hace una pausa larga
    reconocimiento.interimResults = true; // Permite capturar texto mientras el usuario aún está hablando
    reconocimiento.lang = 'es-MX'; // Ajustado a español latino

    reconocimiento.onresult = (event: any) => {
      let transcripcionActual = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcripcionActual += event.results[i][0].transcript;
      }
      
      setTextoTranscrito(transcripcionActual);
    };

    reconocimiento.onend = () => {
      setEscuchando(false);
    };

    reconocimiento.onerror = (event: any) => {
      console.error('Error en el reconocimiento de voz:', event.error);
      setEscuchando(false);
    };

    reconocimientoRef.current = reconocimiento;
  }, []);

  const iniciarEscucha = useCallback(() => {
    if (!reconocimientoRef.current) return;
    
    try {
      setTextoTranscrito(''); // Limpiamos la transcripción anterior
      reconocimientoRef.current.start();
      setEscuchando(true);
    } catch (error) {
      console.error('El micrófono ya está activo', error);
    }
  }, []);

  const detenerEscucha = useCallback(() => {
    if (!reconocimientoRef.current) return;
    reconocimientoRef.current.stop();
    setEscuchando(false);
  }, []);

  const alternarEscucha = () => {
    escuchando ? detenerEscucha() : iniciarEscucha();
  };

  return { 
    escuchando, 
    soportado, 
    textoTranscrito,
    alternarEscucha 
  };
};