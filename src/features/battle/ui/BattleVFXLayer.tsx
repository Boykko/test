import { Droplets, Flame, Heart, ShieldCheck, Snowflake, Sparkles } from "lucide-react";
import React, { useEffect, useState }                               from "react";
import { domRegistry }                                              from "@/shared/lib/domRegistry";
import { VfxItem }                                                  from "../useBattleVisuals";

interface BattleVFXLayerProps {
  queue: VfxItem[];
}

const getElementCenter = (id: string) => {
    let el: HTMLElement | undefined | null = domRegistry.get(id);
    if (!el && (id === 'HERO_PLAYER' || id === 'HERO_ENEMY')) {
        el = document.querySelector(`[data-target-id="${id}"]`) as HTMLElement;
    }
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
    };
};

export const BattleVFXLayer: React.FC<BattleVFXLayerProps> = ({ queue }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        {queue.map(vfx => (
            <VfxInstance key={vfx.id} item={vfx} />
        ))}
    </div>
  );
};

const VfxInstance: React.FC<{ item: VfxItem }> = ({ item }) => {
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [render, setRender] = useState(false);

    useEffect(() => {
        if (item.type === 'FIREBALL' || item.type === 'LIFESTEAL') {
            const source = item.sourceId ? getElementCenter(item.sourceId) : null;
            const target = item.targetId ? getElementCenter(item.targetId) : null;
            if (source && target) {
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                setStyle({
                    left: source.x,
                    top: source.y,
                    '--tx': `${dx}px`,
                    '--ty': `${dy}px`,
                    '--angle': `${angle}deg`,
                } as React.CSSProperties);
                setRender(true);
            }
        } else if (['HEAL', 'BUFF', 'FROST', 'INSTAKILL', 'EXPLOSION', 'REFLECTION'].includes(item.type)) {
            const target = item.targetId ? getElementCenter(item.targetId) : null;
            if (target) {
                setStyle({ left: target.x, top: target.y });
                setRender(true);
            }
        } else if (item.type === 'AOE_NOVA') {
            setStyle({ left: '50%', top: '50%' });
            setRender(true);
        }
    }, [item]);

    if (!render) return null;

    if (item.type === 'REFLECTION') {
        return (
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center pointer-events-none" style={style}>
                 <ShieldCheck className="text-orange-400 w-full h-full animate-ping opacity-60" />
                 <div className="absolute inset-0 border-2 border-orange-500 rounded-full animate-pulse"></div>
            </div>
        );
    }

    if (item.type === 'EXPLOSION') {
        return (
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center pointer-events-none" style={style}>
                 <div className="absolute inset-0 bg-orange-200 rounded-full animate-[boom-flash_0.4s_ease-out_forwards]"></div>
                 <div className="absolute inset-0 border-[10px] border-red-500 rounded-full animate-[nova-expansion_0.4s_ease-out_forwards]"></div>
            </div>
        );
    }

    if (item.type === 'FIREBALL') {
        return (
            <div 
                className="absolute w-12 h-12 flex items-center justify-center animate-[projectile-flight_0.6s_ease-in_forwards]"
                style={style}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-70 animate-pulse"></div>
                    <Flame className="text-yellow-200 fill-orange-500 w-12 h-12 rotate-180 drop-shadow-[0_0_15px_rgba(234,88,12,1)]" />
                </div>
            </div>
        );
    }

    if (item.type === 'LIFESTEAL') {
        return (
            <div 
                className="absolute w-8 h-8 flex items-center justify-center animate-[projectile-flight_0.8s_ease-out_forwards]"
                style={style}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-pink-500 rounded-full blur-md opacity-60"></div>
                    <Heart className="text-white fill-pink-600 w-8 h-8 drop-shadow-lg animate-pulse" />
                </div>
            </div>
        );
    }

    if (item.type === 'HEAL') {
        return (
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 flex items-center justify-center pointer-events-none" style={style}>
                 {[...Array(8)].map((_, i) => (
                     <div key={i} className="absolute animate-[sparkle-rise_1.2s_ease-out_forwards]" style={{ animationDelay: `${i * 0.1}s`, left: `${Math.random() * 60 - 30}px` }}>
                        <Sparkles className="text-yellow-300 w-4 h-4" />
                     </div>
                 ))}
                 <div className="absolute inset-0 bg-green-400/20 blur-2xl rounded-full animate-ping"></div>
            </div>
        );
    }

    if (item.type === 'BUFF') {
        return (
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center" style={style}>
                <div className="absolute inset-0 border-4 border-yellow-400 rounded-full animate-[nova-expansion_0.6s_ease-out_forwards]"></div>
                <div className="absolute inset-0 bg-yellow-400/10 blur-2xl animate-pulse"></div>
            </div>
        );
    }

    if (item.type === 'FROST') {
        return (
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center" style={style}>
                <Snowflake className="text-cyan-200 w-32 h-32 animate-[nova-expansion_0.6s_ease-out_forwards] opacity-60" />
                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"></div>
            </div>
        );
    }

    if (item.type === 'INSTAKILL') {
        return (
             <div className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 flex items-center justify-center" style={style}>
                 <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full animate-pulse"></div>
                 {[...Array(4)].map((_, i) => (
                     <Droplets key={i} className="absolute text-green-500 w-6 h-6 animate-float-damage" style={{ left: `${Math.random()*40-20}px`, animationDelay: `${i*0.2}s` }} />
                 ))}
             </div>
        );
    }

    if (item.type === 'AOE_NOVA') {
        return (
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center" style={style}>
                <div className="w-[100vw] h-[100vw] rounded-full border-[30px] border-orange-500/40 animate-[nova-expansion_0.8s_ease-out_forwards]"></div>
                <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
            </div>
        );
    }

    return null;
};
