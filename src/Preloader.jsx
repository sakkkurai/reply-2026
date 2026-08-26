import { useState, useEffect } from 'react';
import { Text } from './components/ui/Typography';
const IMAGES_TO_PRELOAD = [];

export default function Preloader({ children }) {
    const [isReady, setIsReady] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const loadImages = () => {
            if (IMAGES_TO_PRELOAD.length === 0) return Promise.resolve();

            let loaded = 0;
            return Promise.all(
                IMAGES_TO_PRELOAD.map(
                    (src) =>
                        new Promise((resolve) => {
                            const img = new Image();
                            img.src = src;
                            img.onload = img.onerror = () => {
                                loaded++;
                                if (!cancelled) {
                                    setProgress(Math.round((loaded / IMAGES_TO_PRELOAD.length) * 100));
                                }
                                resolve();
                            };
                        })
                )
            );
        };

        Promise.all([
            document.fonts.ready, // ждём, пока браузер реально загрузит подключённые шрифты
            loadImages(),
        ]).then(() => {
            if (!cancelled) {
                setProgress(100);
                setIsReady(true);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    if (!isReady) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-bg">
                <Text className="text-2xl mb-4">Загрузка...</Text>
                <div className="w-64 h-2 bg-bg-alt rounded-full overflow-hidden">
                    <div
                        className="h-full bg-text transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <Text className="mt-2 text-sm">{progress}%</Text>
            </div>
        );
    }

    return children;
}
