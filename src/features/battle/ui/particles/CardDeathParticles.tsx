import Particles from "@tsparticles/react";
import React     from "react";
import type { ISourceOptions } from "@tsparticles/engine";

interface CardDeathParticlesProps {
    x: number;
    y: number;
    color?: string;
    onComplete?: () => void;
}

export const CardDeathParticles: React.FC<CardDeathParticlesProps> = ({ x, y, color = "#ffffff", onComplete }) => {
    const options: ISourceOptions = {
        fullScreen: { enable: false },
        particles: {
            number: { value: 0 },
            color: { value: color },
            shape: { type: "square" },
            opacity: {
                value: { min: 0.1, max: 1 },
                animation: {
                    enable: true,
                    speed: 1,
                    startValue: "max",
                    destroy: "min"
                }
            },
            size: {
                value: { min: 1, max: 5 },
                animation: {
                    enable: true,
                    speed: 2,
                    minimumValue: 0,
                    sync: false,
                    startValue: "max",
                    destroy: "min"
                }
            },
            move: {
                enable: true,
                speed: { min: 10, max: 25 },
                direction: "none",
                random: true,
                straight: false,
                outModes: { default: "destroy" },
                gravity: {
                    enable: true,
                    acceleration: 20
                }
            },
            life: {
                duration: {
                    sync: true,
                    value: 0.8
                },
                count: 1
            }
        },
        emitters: {
            direction: "none",
            rate: {
                quantity: 150,
                delay: 0
            },
            size: {
                width: 0,
                height: 0,
                mode: "precise"
            },
            position: {
                x: (x / window.innerWidth) * 100,
                y: (y / window.innerHeight) * 100
            },
            life: {
                duration: 0.1,
                count: 1
            }
        },
        interactivity: {
            events: {
                onHover: { enable: false },
                onClick: { enable: false }
            }
        },
        detectRetina: true
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-[100]">
            <Particles
                id={`death-particles-${Date.now()}`}
                options={options}
            />
        </div>
    );
};
