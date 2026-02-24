import React from 'react';

const TerminalInput = React.memo(({ 
    query, 
    setQuery, 
    handleSubmit, 
    handleKeyDown, 
    loading, 
    inputRef 
}) => {
        return (
            <form onSubmit={handleSubmit} className="terminal-input-form">
                <div className="input-wrapper">
                    <span className="prompt">»</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter command"
                            className="terminal-input"
                            disabled={loading}
                            autoComplete="off"
                        />
                </div>
            </form>
    );
});

TerminalInput.displayName = 'TerminalInput';

export default TerminalInput;