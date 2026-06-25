import { useState, useEffect, useRef, useCallback } from 'react';

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
  const [errorVoz, setErrorVoz] = useState<string | null>(null);

  const reconocimientoRef = useRef<any>(null);

  useEffect(() => {
    console.log('🔍 [Voz Hook] Verificando soporte de WebSpeech API en el navegador...');

    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.error('❌ [Voz Hook] El navegador actual NO soporta SpeechRecognition.');
      setSoportado(false);
      return;
    }

    console.log('✅ [Voz Hook] El navegador soporta la API de voz de forma nativa.');
  }, []);

  const iniciarEscucha = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    console.log('🎙️ [Voz Hook] Ejecutando iniciarEscucha(). Creando nueva instancia en caliente...');
    setErrorVoz(null);

    const reconocimiento = new SpeechRecognition();

    // Configuraciones clave
    reconocimiento.continuous = true;     // Cambiado a TRUE para evitar que se apague solo en micro-pausas
    reconocimiento.interimResults = true;  // Envía fragmentos parciales mientras sigues hablando
    reconocimiento.lang = 'es-MX';

    // EVENTO 1: Cuando el micrófono se abre con éxito
    reconocimiento.onstart = () => {
      console.log('🟢 [Voz Hook -> onstart] El micrófono está abierto. El navegador está ESCUCHANDO activamente.');
      setEscuchando(true);
    };

    // EVENTO 2: Cuando captura voz y la procesa en texto
    reconocimiento.onresult = (event: any) => {
      console.log(`📥 [Voz Hook -> onresult] Se recibió señal de audio. Total resultados: ${event.results.length}`);
      let transcripcionActual = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const fragmento = event.results[i][0].transcript;
        const esFinal = event.results[i].isFinal;
        console.log(`   └─ Resultado [${i}]: "${fragmento}" | ¿Es frase finalizada?: ${esFinal}`);
        transcripcionActual += fragmento;
      }

      setTextoTranscrito(transcripcionActual);
    };

    // EVENTO 3: Captura de errores críticos del sistema de audio del navegador
    reconocimiento.onerror = (event: any) => {
      console.error('🚨 [Voz Hook -> onerror] Ocurrió un fallo en el pipeline de voz:', event.error);

      if (event.error === 'not-allowed') {
        setErrorVoz('Permiso denegado. Haz clic en el candado de la barra de direcciones y activa el micrófono.');
        console.error('👉 [Consejo de Permiso] Chrome bloqueó la petición porque el permiso fue denegado o no estás usando localhost/HTTPS.');
      } else if (event.error === 'no-speech') {
        console.warn('⚠️ [Aviso de Voz] No se detectó sonido en la ventana de tiempo.');
        // No apagamos el estado bruscamente si es un no-speech intermedio en modo continuous
        return;
      } else {
        setErrorVoz(`Fallo de micrófono: ${event.error}`);
      }

      setEscuchando(false);
    };

    // EVENTO 4: Cuando la sesión de grabación termina por completo
    reconocimiento.onend = () => {
      console.log('🔴 [Voz Hook -> onend] El hilo de captura se cerró de forma natural (Micrófono APAGADO).');
      setEscuchando(false);
    };

    try {
      setTextoTranscrito('');
      reconocimiento.start();
      reconocimientoRef.current = reconocimiento;
      console.log('🚀 [Voz Hook] reconocimiento.start() disparado exitosamente.');
    } catch (error) {
      console.error('❌ [Voz Hook] Crash al intentar invocar start():', error);
    }
  }, []);

  const detenerEscucha = useCallback(() => {
    if (!reconocimientoRef.current) {
      console.warn('⚠️ [Voz Hook] Intentaste detener el micrófono pero no hay ninguna instancia activa.');
      return;
    }

    console.log('⏹️ [Voz Hook] Ejecutando detenerEscucha(). Deteniendo motor de voz...');
    reconocimientoRef.current.stop();
    reconocimientoRef.current = null;
    setEscuchando(false);
  }, []);

  const alternarEscucha = () => {
    console.log(`Click detectado en el botón de voz. Estado actual "escuchando": ${escuchando}`);
    escuchando ? detenerEscucha() : iniciarEscucha();
  };

  return {
    escuchando,
    soportado,
    textoTranscrito,
    errorVoz,
    alternarEscucha
  };
};