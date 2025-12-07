import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode } from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
};

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-md",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-6xl",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative bg-neutral-900 rounded-xl shadow-2xl w-full",
                    "border border-neutral-800 animate-in fade-in zoom-in duration-200",
                    "max-h-[90vh] overflow-y-auto",
                    sizes[size]
                )}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-neutral-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6">{children}</div>
            </div>
        </div>
    );
}
