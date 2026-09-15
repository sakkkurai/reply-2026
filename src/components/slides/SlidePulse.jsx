import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PULSE_DESCRIPTION, PULSE_TITLE, PULSE_DAY, PULSE_NEXT, PULSE_LESS, PULSE_GREATER } from '../../constants/strings';
import { Button, BUTTON_ACCENT, Text, Title } from '../ui/Typography';
import metrics from '../../constants/metrics.json';

const MONTHS_GENITIVE = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];
const MONTHS_SHORT = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
];

const CELL = 16;
const GAP = 4;
const COL = CELL + GAP;

function formatDay(isoDate) {
    const [, m, d] = isoDate.split('-').map(Number);
    return `${d} ${MONTHS_GENITIVE[m - 1]}`;
}

function buildWeeks(dailyCounts) {
    const days = dailyCounts.map(([date, count]) => ({ date, count }));
    const firstDate = new Date(days[0].date);
    const startPad = firstDate.getDay() === 0 ? 6 : firstDate.getDay() - 1;

    const padded = [...Array(startPad).fill(null), ...days];
    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) {
        weeks.push(padded.slice(i, i + 7));
    }
    return weeks;
}

function buildMonthLabels(weeks) {
    const labels = [];
    let lastMonth = null;
    weeks.forEach((week, wi) => {
        const firstCell = week.find((c) => c);
        if (!firstCell) return;
        const month = Number(firstCell.date.split('-')[1]) - 1;
        if (month !== lastMonth) {
            labels.push({ weekIndex: wi, label: MONTHS_SHORT[month] });
            lastMonth = month;
        }
    });
    return labels;
}

function median(numbers) {
    const s = [...numbers].sort((a, b) => a - b);
    const n = s.length;
    if (n === 0) return 0;
    const mid = Math.floor(n / 2);
    return n % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function intensityClass(count, med) {
    if (!count) return 'bg-text/[0.06]';
    if (med === 0) return 'bg-text/40';
    const ratio = count / med;
    if (ratio > 2) return 'bg-text';
    if (ratio > 1.5) return 'bg-text/70';
    if (ratio > 1) return 'bg-text/45';
    if (ratio > 0.5) return 'bg-text/25';
    return 'bg-text/12';
}

export default function SlidePulse({ onComplete, completedData, goNext }) {
    const [done, setDone] = useState(Boolean(completedData));
    const [tooltip, setTooltip] = useState(null);
    const containerRef = useRef(null);

    const { daily_counts } = metrics.pulse;
    const weeks = buildWeeks(daily_counts);
    const monthLabels = buildMonthLabels(weeks);
    const med = median(daily_counts.map(([, c]) => c).filter((c) => c > 0));

    const showTooltip = (cell, e) => {
        if (!cell || !cell.count) return;
        setTooltip({
            cell,
            pageX: e.clientX,
            pageY: e.clientY,
        });
    };

    const hideTooltip = () => setTooltip(null);

    const gridWidth = weeks.length * COL - GAP;

    useEffect(() => {
        if (!done) {
            setDone(true);
            onComplete?.(true);
        }
    });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
            <div className="text-center">
                <Title>{PULSE_TITLE}</Title>
            </div>

            <div ref={containerRef} className="relative overflow-x-auto max-w-full py-2 scrollbar-none">
                <div className="relative h-4 mb-1" style={{ width: gridWidth }}>
                    {monthLabels.map(({ weekIndex, label }) => (
                        <span
                            key={weekIndex}
                            className="absolute text-sm whitespace-nowrap font-script-caveat"
                            style={{ left: weekIndex * COL }}
                        >
                            {label}
                        </span>
                    ))}
                </div>

                <div className="flex gap-1">
                    {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-1">
                            {week.map((cell, di) => (
                                <button
                                    key={di}
                                    data-no-tap-nav
                                    disabled={!cell}
                                    onMouseEnter={(e) => showTooltip(cell, e)}
                                    onMouseMove={(e) => showTooltip(cell, e)}
                                    onMouseLeave={hideTooltip}
                                    onClick={(e) => showTooltip(cell, e)}
                                    className={`w-4 h-4 rounded-sm transition-transform ${cell
                                        ? `${intensityClass(cell.count, med)} cursor-pointer hover:scale-125`
                                        : 'bg-transparent'
                                        }`}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {tooltip && (
                        <motion.div
                            key={tooltip.cell.date}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed z-50 pointer-events-none"
                            style={{
                                left: tooltip.pageX,
                                top: tooltip.pageY - 12,
                                transform: 'translate(-50%, -100%)',
                            }}
                        >
                            <span
                                className="block bg-text text-bg text-sm text-center leading-snug rounded-lg px-4 py-2 font-script-caveat"
                                style={{ width: 'max-content', maxWidth: 220 }}
                            >
                                {PULSE_DAY(formatDay(tooltip.cell.date), tooltip.cell.count)}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 text-xs">
                <Text className='text-xl pe-2'>{PULSE_LESS}</Text>
                {['bg-text/[0.06]', 'bg-text/12', 'bg-text/25', 'bg-text/45', 'bg-text/70', 'bg-text'].map((cls, i) => (
                    <span key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
                ))}
                <Text className='text-xl ps-2'>{PULSE_GREATER}</Text>
            </div>
            <Text className="text-xl mt-2">{PULSE_DESCRIPTION}</Text>


            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Button data-no-tap-nav state={BUTTON_ACCENT} onClick={goNext}>
                    {PULSE_NEXT}
                </Button>
            </motion.div>
        </div>
    );
}
