import { UtensilsCrossed } from "lucide-react";

const Loader = ({ fullScreen = false, text = "Loading..." }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/60 backdrop-blur-[2px] z-[9999] flex flex-col items-center justify-center transition-opacity duration-150">
                <div className="relative">
                    {/* Faster Rotating Circle */}
                    <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin [animation-duration:0.6s]"></div>

                    {/* Inner Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <UtensilsCrossed className="w-6 h-6 text-primary animate-bounce-slow" />
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <h3 className="text-sm font-black text-foreground tracking-widest uppercase opacity-80">{text}</h3>
                    <div className="flex gap-1 justify-center mt-2">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s] [animation-duration:0.6s]"></div>
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s] [animation-duration:0.6s]"></div>
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-duration:0.6s]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 transition-all duration-200">
            <div className="relative">
                <div className="w-10 h-10 border-3 border-secondary/10 border-t-secondary rounded-full animate-spin [animation-duration:0.6s]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4 text-secondary animate-pulse" />
                </div>
            </div>
            {text && (
                <p className="mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    {text}
                </p>
            )}
        </div>
    );
};

export default Loader;
