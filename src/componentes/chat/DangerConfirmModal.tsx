import { AlertTriangle } from "lucide-react";

interface Props {
    open: boolean;
    title: string;
    description: string;
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DangerConfirmModal({
    open,
    title,
    description,
    loading,
    onConfirm,
    onCancel
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center">

            <div className="w-full max-w-md rounded-2xl bg-[#111] border border-red-900 p-6">

                <div className="flex flex-col items-center text-center mb-5">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                        <AlertTriangle className="text-red-400" size={20} />
                    </div>

                    <h2 className="text-white text-lg font-semibold">
                        {title}
                    </h2>

                    <p className="text-neutral-400 text-sm mt-2">
                        {description}
                    </p>
                </div>

                <div className="flex gap-3 justify-end">

                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-neutral-800 text-white"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white"
                    >
                        {loading ? "Eliminando..." : "Confirmar"}
                    </button>

                </div>

            </div>

        </div>
    );
}