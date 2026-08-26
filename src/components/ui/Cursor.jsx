import { Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Cursor({ smoothness = 0.85 }) {
    const trail = useRef(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const trailPos = useRef({ x: 0, y: 0 });
    const trailSize = useRef({ width: 12, height: 12 });
    const [isPointer, setIsPointer] = useState(false);

    useEffect(() => {
        let frame;

        const move = () => {
            const hovered = document.elementFromPoint(mousePos.current.x, mousePos.current.y);
            const cursorStyle = hovered ? getComputedStyle(hovered).cursor : 'default';

            trailPos.current.x = trailPos.current.x * smoothness + mousePos.current.x * (1 - smoothness);
            trailPos.current.y = trailPos.current.y * smoothness + mousePos.current.y * (1 - smoothness);

            const targetSize = cursorStyle === 'pointer' ? { width: 40, height: 40 } : { width: 12, height: 12 };
            trailSize.current.width = trailSize.current.width * smoothness + targetSize.width * (1 - smoothness);
            trailSize.current.height = trailSize.current.height * smoothness + targetSize.height * (1 - smoothness);

            if (trail.current) {
                trail.current.style.left = `${trailPos.current.x}px`;
                trail.current.style.top = `${trailPos.current.y}px`;
                trail.current.style.width = `${trailSize.current.width}px`;
                trail.current.style.height = `${trailSize.current.height}px`;
            }

            setIsPointer(cursorStyle === 'pointer');
            frame = requestAnimationFrame(move);
        };

        frame = requestAnimationFrame(move);
        return () => cancelAnimationFrame(frame);
    }, [smoothness]);

    useEffect(() => {
        const handleMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        document.addEventListener('mousemove', handleMove);
        return () => document.removeEventListener('mousemove', handleMove);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
            <div
                ref={trail}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center transition-colors duration-300"
            >
                <Heart
                    className={isPointer ? 'text-text/70' : 'text-text/40'}
                    fill="currentColor"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
}
