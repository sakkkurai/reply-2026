export function Title({ children, className = '' }) {
    return (
        <h1 className={`text-center text-7xl font-bold font-script-marck ${className}`}>
            {children}
        </h1>
    );
}

export function Text({ children, className = '' }) {
    return (
        <p className={`text-center text-3xl font-script-caveat whitespace-pre-line ${className}`}>
            {children}
        </p>
    );
}

export const BUTTON_ACCENT = 1;
export const BUTTON_SECONDARY = 2;
const STATE_STYLES = {
    [BUTTON_ACCENT]: 'bg-text text-bg',
    [BUTTON_SECONDARY]: 'bg-bg-alt text-text border-2 border-text',
};

export function Button({ children, className = '', onClick, state }) {
    return (
        <button onClick={onClick} className={`font-script-caveat flex justify-center text-4xl bg-bg-alt px-12 py-4 rounded-full cursor-pointer transition-transform duration-200 hover:scale-105 ${STATE_STYLES[state]} ${className}`}>
            {children}
        </button>
    );
}
