import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
};

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={cn(
                "relative bg-neutral-900 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4",
                "border border-neutral-800 animate-in fade-in zoom-in duration-200"
            )}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                        <p className="text-sm text-neutral-300 mb-6">{message}</p>

                        <div className="flex gap-3 justify-end">
                            <Button variant="ghost" onClick={onClose}>
                                {cancelText}
                            </Button>
                            <Button variant="destructive" onClick={onConfirm}>
                                {confirmText}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
