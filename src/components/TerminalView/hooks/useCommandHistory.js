import { useState, useEffect, useCallback } from 'react';

export const useCommandHistory = (maxSize = 256) => {
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // load command history
    useEffect(() => {
        const restoreHistory = localStorage.getItem('terminalHistory');
        if (restoreHistory) {
            try {
                setCommandHistory(JSON.parse(restoreHistory));
            } catch (error) {
                console.error('Failed to load command history:', error);
            }
        }
    }, []);


    // save command history
    useEffect(() => {
        if (commandHistory.length > 0) {
            localStorage.setItem('terminalHistory', JSON.stringify(commandHistory));
        }
    }, [commandHistory]);

    const addToHistory = useCallback((command) => {
        setCommandHistory(prev => {
            if(prev[0] === command) {
                return prev;
            }
            return [command, ...prev].slice(0, maxSize);
        });
        setHistoryIndex(-1);
    }, [maxSize]);

    const navigatePrevious = useCallback(() => {
        if (commandHistory.length > 0) {
            const newIndex = Math.min(historyIndex + 1, commandHistory.length -1);
            setHistoryIndex(newIndex);
            return commandHistory[newIndex];
        }
        return null;
    }, [commandHistory, historyIndex]);

    const navigateNext = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex -1;
            setHistoryIndex(newIndex);
            return commandHistory[newIndex];
        } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            return '';
        }
        return null;
    }, [commandHistory, historyIndex]);

    return {
        commandHistory,
        addToHistory,
        navigatePrevious,
        navigateNext
    };
};