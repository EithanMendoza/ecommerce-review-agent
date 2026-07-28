import React from 'react';
import { createPortal } from 'react-dom';

interface ModalBaseProps {
    isOpen: boolean;
    children: React.ReactNode;
}

export default function ModalBase({ isOpen, children }: ModalBaseProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn p-0 sm:p-6">
            <div className="w-full h-full sm:h-[600px] sm:max-w-5xl rounded-none sm:rounded-3xl overflow-hidden bg-[#141414] border-0 sm:border sm:border-neutral-800 shadow-2xl flex flex-col relative">
                {children}
            </div>
        </div>,
        document.body
    );
}