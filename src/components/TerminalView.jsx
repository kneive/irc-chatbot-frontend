import React, { useState, useEffect, useRef } from 'react';
import 'TerminalView.css';

function TerminalView(){
    const [entries, setEntries] = useState([]);
    const [query, setQuery] = useState('');
    const [loadiing, setLoading] = useState(false);
    const terminalRef = useRef(null);

    // Auto-scroll to the bottom when entries are added
    useEffect(() => {
        if (tertminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [entries]);

    // Fetch initial data
    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const response = await fetch('api/entries');
            const data = await response.json();
            setEntries(data);
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);

        setEntries(prev => [...prev, { type: 'query', text: `> ${query}`}]);

        try {
            const response = await fetch('api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query})
            });

            const result = await response.json();

            // Add results to terminal output
            setEntries(prev => [...prev, {
                type: 'result',
                text: JSON.stringify(result,null,2),
                timestamp: new Date().toISOString()
            }]);

            setQuery('');
        } catch (error) {
            setEntries(prev => [...prev, {
                type: 'error',
                text: `Error: ${error.message}`
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey){
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="terminal-container">
            <div className="terminal-output" ref={terminalRef}>
                {entries.map((entry, index) => (
                    <div key={index} classname={`terminal-line ${entry.type}`}>
                        {entry.timestamp && (
                            <span className="timestamp">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>
                        )}
                        <pre>{entry.text}</pre>
                    </div>
                ))}
                {loading && <div className="terminal-line loading">Loading...</div>}
            </div>

            <form onSubmit={handleSubmit} className="terminal-input-form">
                <div classname="input-wrapper">
                    <span className="prompt">$</span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter SQL query or command"
                        className="terminal-input"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
}
export default TerminalView;