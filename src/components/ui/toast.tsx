import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

type ToastProps = {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
};

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: CheckCircle2,
        error: XCircle,
        info: Info,
    };

    const colors = {
        success: "bg-emerald-500",
        error: "bg-rose-500",
        info: "bg-blue-500",
    };

    const Icon = icons[type];

    return (
        <div
            className={cn(
                "fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300",
                colors[type],
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            )}
        >
            <Icon className="w-5 h-5" />
            <p className="text-sm font-medium">{message}</p>
            <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="ml-2 hover:opacity-80">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
