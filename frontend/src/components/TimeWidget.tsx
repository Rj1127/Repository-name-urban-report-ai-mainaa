import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function TimeWidget() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const formattedDate = time.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-900/5 border border-red-900/20 dark:bg-red-900/20 dark:border-red-400/30 shadow-sm text-sm font-medium transition-all hover:bg-red-900/10 dark:hover:bg-red-900/30 mx-1">
            <Clock className="h-4 w-4 text-[#800000] dark:text-[#ff8080]" />
            <span className="text-[#800000] dark:text-[#ff8080] tracking-wide font-bold">{formattedTime}</span>
            <span className="text-[#800000]/80 dark:text-[#ff8080]/80 text-xs hidden xl:inline-block border-l border-[#800000]/20 dark:border-[#ff8080]/30 pl-2 ml-0.5">
                {formattedDate}
            </span>
        </div>
    );
}
