import React, { useRef, useCallback, useMemo } from 'react';
import { parseCommand } from './utils/commandParser';
import { createCommandExecutor } from './utils/commandExecutor';
import { formatDataItems } from './utils/formatDataItems.jsx';
import { createHandlers } from './handlers';
import {
    useBackendConnection,
    useCommandHistory,
    useVirtualization,
    useTerminalState
} from './hooks';
import { createAPIClient } from './utils/apiClient';
import TerminalInput from './TerminalInput';
import './TerminalView.css';

function TerminalView() {

    const inputRef = useRef(null);

    const { backendURL, setBackendURL, getAPIURL } = useBackendConnection();
    const { 
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
    } = useTerminalState();

    const { addToHistory, navigatePrevious, navigateNext } = useCommandHistory();
    const { parentRef, virtualItems, totalSize } = useVirtualization(entries);

    const apiClient = useMemo(() =>
        createAPIClient(backendURL),
        [backendURL]
    );

    const handlers = useMemo(() =>
        createHandlers(apiClient, setBackendURL, setEntries, setPaginationState),
        [apiClient, setBackendURL, setEntries, setPaginationState]
    );

    const executeCommand = useMemo(() =>
        createCommandExecutor(handlers, setPaginationState, clearTerminal),
        [handlers, setPaginationState, clearTerminal]
    );

    React.useEffect(() => {
        if(!loading && inputRef.current){
            inputRef.current.focus();
        }
    }, [loading]);

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        addToHistory(query);

        addEntry({
            type: 'query',
            text: `> ${query}`,
            unformattedText: `> ${query}`,
            timestamp: new Date().toISOString()
        });

        try {
            const{ cmd, args } = parseCommand(query);
            const result = await  executeCommand(cmd, args);

            if(result){
                const formattedItems = formatDataItems(result.data, result.format);
                addEntries(formattedItems);
            }

            setQuery('');
        } catch (error) {
            addEntry({
                type: 'error',
                text: `Error: ${error.message}`,
                unformattedText: `Error: ${EvalError.message}`,
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    }, [query, 
        addToHistory, 
        addEntry, 
        addEntries, 
        setLoading, 
        setQuery, 
        parseCommand, 
        executeCommand]);

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prevCommand = navigatePrevious();
            if(prevCommand !== null) {
                setQuery(prevCommand);
            }
        } else if (event.key === 'ArrowDown'){
            event.preventDefault();
            const nextCommand = navigateNext();
            if (nextCommand !== null){
                setQuery(nextCommand);
            }
        }
    }, [navigatePrevious, navigateNext, setQuery]);

    return (
        <div className="terminal-container">
            <div
                ref={parentRef}
                className="terminal-output"
                style={{
                    height: '600px',
                    overflow: 'auto'
                }}
            >    
                <div
                    style={{
                        height: `${totalSize}px`,
                        width: '100%',
                        position: 'relative'
                    }}
                >
                    {virtualItems.map((virtualItem)=>{
                        const entry = entries[virtualItem.index];
                        return (
                            <div
                                key={virtualItem.key}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualItem.size}px`,
                                    transform: `translateY(${virtualItem.start}px)`
                                }}
                                className={`terminal-line ${entry.type}`}
                            >
                                {entry.timestamp && (
                                    <span className="timestamp">
                                        [{new Date(entry.timestamp).toLocaleTimeString()}]
                                    </span>
                                )}
                                {entry.content ? (
                                    entry.content
                                ) : entry.text ? (
                                    <pre>{entry.text}</pre>
                                ) : null}
                            </div>
                        );
                    })}
                </div>

                {paginationState.isLoadingMore && (
                    <div className="terminal-line loading" style={{
                        position: 'relative',
                        padding: '10px 20px'
                    }}>
                        Loading data...
                    </div>
                )}
            </div>

            {loading && <div className="terminal-line loading">Loading...</div>}

            <TerminalInput
                query={query}
                setQuery={setQuery}
                handleSubmit={handleSubmit}
                handleKeyDown={handleKeyDown}
                loading={loading}
                inputRef={inputRef}
            />
        </div>
    );
}
export default TerminalView;