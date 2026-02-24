import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export const useVirtualization = (entries) => {
    const parentRef = useRef(null);

    const virtualizer = useVirtualizer({
        count: entries.length,
        getScrollElement: () => parentRef.current,
        estimateSize: useCallback((index) => {
            const entry = entries[index];

            // Fallback for empty entries
            if(!entry?.unformattedText) {
                return 60;
            }

            const containerWidth = parentRef.current?.clientWidth || 800;
            const availableWidth = containerWidth - 56;
            const charWidth = 9.4;
            const charsPerLine = Math.floor(availableWidth / charWidth);
            const lines = Math.ceil(entry.unformattedText.length / charsPerLine);

            const lineHeight = 18;

            if (lines > 1) {
                const padding = 40;
                const marginBottom = 10;
                return Math.max(80, lines * lineHeight + padding + marginBottom);
            } else {
                const padding = 40;
                const marginBottom = 5;
                return Math.max(60, lineHeight + padding +marginBottom);
            }
        }, [entries]),
        overscan: 10,
        measureElement: (element) => element.getBoundingClientRect().height,
    });

    const virtualItems = useMemo(() =>
        virtualizer.getVirtualItems(), 
        [virtualizer.getVirtualItems()]
    );

    const totalSize = useMemo(() =>
        virtualizer.getTotalSize(),
        [virtualizer.getTotalSize()]
    );


    // adjust heights when then window is resized 
    useEffect(() => {
        const handleResize = () => {
            virtualizer.measure();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [virtualizer]);

    // observe parent container for size changes
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            virtualizer.measure();
        });

        if(parentRef.current) {
            resizeObserver.observe(parentRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [virtualizer]);

    // auto scroll down
    useEffect(() => {
        if (entries.length > 0) {
            virtualizer.scrollToIndex(entries.length - 1, {
                align: 'end',
                behavior: 'smooth'
            });
        }
    }, [entries.length, virtualizer]);

    return {
        parentRef,
        virtualizer,
        virtualItems,
        totalSize
    };
};