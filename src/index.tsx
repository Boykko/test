import React, { useEffect, useState } from "react";
import ReactDOM                       from "react-dom/client";
import App                            from "./app/App";
import { initParticlesEngine }        from "@tsparticles/react";
import { loadSlim }                   from "@tsparticles/slim";

const Root: React.FC = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    return (
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(<Root />);