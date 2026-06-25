import { useEffect, useState, useRef } from 'react';

export default function OndasVoz() {
    // 75 barras delgaditas y pegadas para el flujo continuo
    const TOTAL_BARRAS = 75;

    const [historialOndas, setHistorialOndas] = useState<number[]>(
        new Array(TOTAL_BARRAS).fill(1)
    );

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        async function inicializarAudio() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                const audioContext = new AudioContextClass();
                const analyser = audioContext.createAnalyser();

                // Suavizado de tiempo para que la transición entre picos sea orgánica y no salte bruscamente
                analyser.smoothingTimeConstant = 0.4;
                analyser.fftSize = 32;

                const fuente = audioContext.createMediaStreamSource(stream);
                fuente.connect(analyser);

                audioContextRef.current = audioContext;
                analyserRef.current = analyser;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                intervalRef.current = window.setInterval(() => {
                    if (!analyserRef.current) return;
                    analyserRef.current.getByteFrequencyData(dataArray);

                    let suma = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        suma += dataArray[i];
                    }
                    const promedio = suma / dataArray.length;

                    // 🎯 FILTRO DE VOZ: Ajustamos el umbral a 55 para cortar de raíz el ruido de fondo
                    const UMBRAL_VOZ_ESTRICTO = 40;
                    let volumenNormalizado = 0;

                    if (promedio > UMBRAL_VOZ_ESTRICTO) {
                        // Si supera el umbral, calculamos la fuerza real de la voz
                        volumenNormalizado = (promedio - UMBRAL_VOZ_ESTRICTO) / 8;
                    }

                    // Generamos la escala de la barra (Mínimo 1 = plana, Máximo 5 = pico alto)
                    const nuevaOnda = 1 + Math.min(4, volumenNormalizado * 3.5);

                    // Desplazamiento fluido estilo WhatsApp hacia la izquierda
                    setHistorialOndas((prev) => [...prev.slice(1), nuevaOnda]);
                }, 90); // Sutilmente más rápido (40ms) para mayor fluidez de movimiento

            } catch (error) {
                console.error('Error al calibrar filtro de voz:', error);
            }
        }

        inicializarAudio();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    return (
        <div className="flex-1 flex items-center justify-center gap-[2px] w-full h-8 px-2 overflow-hidden select-none">
            {historialOndas.map((escalaY, index) => {
                // Atenuación en los extremos izquierdo y derecho para un acabado redondeado y limpio
                const factorExtremo = index < 6 ? index * 0.16 : index > TOTAL_BARRAS - 7 ? (TOTAL_BARRAS - 1 - index) * 0.16 : 1;
                const alturaFinal = 1 + (escalaY - 1) * factorExtremo;

                return (
                    <div
                        key={index}
                        className="flex-1 min-w-[2px] h-1.5 rounded-full transition-all duration-75 origin-center shrink-0"
                        style={{
                            transform: `scaleY(${alturaFinal})`,
                            // Si la barra se levanta, cambia a un tono índigo claro, si está en silencio se integra al fondo oscuro
                            backgroundColor: alturaFinal > 1.3 ? '#a5b4fc' : '#525252'
                        }}
                    />
                );
            })}
        </div>
    );
}