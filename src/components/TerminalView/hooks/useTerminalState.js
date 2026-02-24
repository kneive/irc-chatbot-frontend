import { useState } from 'react';

export const useTerminalState = () =>{
    const [entries, setEntries] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const [paginationState, setPaginationState] = useState({
        hasMore: false,
        isLoadingMore: false,
        currentOffset: 0,
        lastCommand: null,
        lastArgs: null
    });

    const clearTerminal = () => {
        setEntries([]);
        setQuery('');
        setPaginationState({
            hasMore: false,
            isLoadingMore: false,
            currentOffset: 0,
            lastCommand: null,
            lastArgs: null
        });
    };

    const addEntry = (entry) => {
        setEntries(prev => [...prev, entry]);
    };

    const addEntries = (newEntries) =>{
        setEntries(prev => [...prev, ...newEntries]);
    };

    return {
        entries,
        setEntries,
        query,
        setQuery,
        loading,
        setLoading,
        paginationState,
        setPaginationState,
        clearTerminal,
        addEntry,
        addEntries
    };
};