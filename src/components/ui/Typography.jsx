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

export function Button({ children, className = '', onClick, state }) {
    return (
        <button onClick={onClick} className={`bg-text text-bg font-script-caveat flex justify-center text-4xl bg-bg-alt px-12 py-4 rounded-full cursor-pointer transition-transform duration-200 hover:scale-105 ${className}`}>
            {children}
        </button>
    );
}
