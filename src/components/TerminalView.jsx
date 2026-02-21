import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import './TerminalView.css';

const TerminalInput = React.memo(({ query, setQuery, handleSubmit, handleKeyDown, loading }) => {
    return (
        <form onSubmit={handleSubmit} className="terminal-input-form">
            <div className="input-wrapper">
                <span className="prompt">»</span>
                    <input
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

function TerminalView(){
    const [entries, setEntries] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const parentRef = useRef(null);


    // Fetch initial data
    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const response = await fetch('/api/');

            if (!response.ok){
                console.warn(`API returned status ${response.status}`);
                setEntries([]);
                return;
            }

            const data = await response.json();

            console.log('API Info:', data);
            setEntries([{
                type: 'info',
                text: `Connected to ${data.message} v${data.version}`,
                timestamp: new Date().toISOString()
            }]);

        } catch (error) {
            console.error('Error fetching entries:', error);
            setEntries([]);
        }
    };

    const virtualizer = useVirtualizer({
        count: entries.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            const entry = entries[index];
            if (entry?.data) {
                return Math.max(50, entry.data.length * 30 + 20);
            }
            return 50;
        },
        overscan: 5,
        measureElement: (el) => el?.getBoundingClientRect().height,
    });

    const virtualItems = useMemo(() => virtualizer.getVirtualItems(), [virtualizer.getVirtualItems()]);
    const totalSize = useMemo(() => virtualizer.getTotalSize(), [virtualizer.getTotalSize()]);

    // Auto-scroll to the bottom when entries are added
    useEffect(() => {
        if (entries.length > 0) {
            virtualizer.scrollToIndex(entries.length - 1, {
                align: 'end',
                behavior: 'smooth'
            });
        }
    }, [entries.length, virtualizer]);

    const renderFormattedData = (data, format) => {
        switch(format){
            case 'user-list':
                return data.map((item, i) => (
                    <div key={i}>
                        <span className="username">{item.username}</span>
                        {' : '}
                        <span className="uid">{item.uid}</span>
                    </div>
                ));
            case 'message-list':
                return data.map((item, i) => (
                    <div key={i}>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="room">{item.room}</span>
                        {' '}
                        <span className="username">{item.username}</span>
                        {' : '}
                        <span className="message">{item.message}</span>
                    </div>
                ));
            case 'sub-list':
                return data.map((item, i) => (
                    <div key={i}>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="username">{item.username}</span>
                        {' '}
                        <span className="room">{item.room}</span>
                        {' : '}
                        <span className="type">{item.type}</span>
                    </div>
                ));

            case 'gift-list':
                return data.map((item, i) => (
                    <div key={i}>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="username">{item.username}</span>
                        {' '}
                        <span className="room">{item.room}</span>
                        {' : '}
                        <span className="type">{item.type}</span>
                        {' '}
                        <span className="amount">{item.amount}</span>
                    </div>
                ));
            case "announcement-list":
                return data.map((item, i) => (
                    <div key={i}>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="username">{item.username}</span>
                        {' '}
                        <span className="room">{item.room}</span>
                        {' : '}
                        <span className="system-message">{item.systemMessage}</span>
                    </div>
                ));
            case "bits-list":
                return data.map((item, i) => (
                    <div key={i}>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="username">{item.username}</span>
                        {' '}
                        <span className="room">{item.room}</span>
                        {' : '}
                        <span className="amount">{item.amount}</span>
                    </div>
                ));
            case "payforward-list":
                return data.map((item, i) => (
                    <div key={i}>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="username">{item.username}</span>
                        {' '}
                        <span className="room">{item.room}</span>
                        {' : '}
                        <span className="type">{item.type}</span>
                        {' '}
                        <span className="recipient">{item.recipient}</span>
                    </div>
                ));
            case "paidupgrade-list":
                return data.map((item, i) => (
                    <div key={i}>
                        <span className="rtimestamp">{item.timestamp}</span>
                        {' '}
                        <span className="username">{item.username}</span>
                        {' '}
                        <span className="room">{item.room}</span>
                        {' : '}
                        <span className="type">{item.type}</span>
                        {' '}
                        <span className="recipient">{item.recipient}</span>
                    </div>
                ));
            case "onetapgift-list":
                return data.map((item, i) => (
                    <div key={i}>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="username">{item.username}</span>
                        {' '}
                        <span className="room">{item.room}</span>
                        {' : '}
                        <span className="type">{item.type}</span>
                    </div>
                ));
            case "help-all":
                return data.map((item, i) => (
                    <div key={i}>
                        <span className="command">{item.command}</span>
                        {' : '}
                        <span className="syntax">{item.syntax}</span>
                        {' - '}
                        <span className="description">{item.description}</span>
                    </div>
                ));
            case "help-single":
                return data.map((item, i) => (
                    <div key={i}>
                        <div><span className="label">Syntax:</span>{item.syntax}</div>
                        <div><span className="label">Description:</span>{item.description}</div>
                    </div>
                ));
            default:
                return <pre>{JSON.stringify(data, null, 2)}</pre>
        }
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);

        setEntries(prev => [...prev, { type: 'query', text: `> ${query}`}]);

        try {
            const command = query.trim().toLowerCase();
            const parts = command.split(' ');
            const cmd = parts.slice(0, 2).join(' ');
            const args = parts.slice(2);

            let result;

            switch(cmd){
                case 'clear': 
                    setEntries([]);
                    setQuery('');
                    return;
                case 'get user':
                    result = await handleGetUser(args);
                    break;
                case 'get users':
                    result = await handleGetUsers(args);
                    break;
                case 'get messages':
                    result = await handleGetMessages(args);
                    break;
                case 'get subs':
                    result = await handleGetSubs(args);
                    break;
                case 'get gift':
                    result = await handleGetGift(args);
                    break;
                case 'get announcement':
                    result = await handleGetAnnouncement(args);
                    break;
                case 'get bits':
                    result = await handleGetBits(args);
                    break;
                case 'get payforward':
                    result = await handleGetPayforward(args);
                    break;
                case 'get paidupgrade':
                    result = await handleGetPaidupgrade(args);
                    break;
                case 'get onetapgift':
                    result = await handleGetOnetapgift(args);
                    break;
                case 'help':
                    result = await handleHelp(args);
                    break;
                default:
                    throw new Error(`Unknown command: ${cmd}`);
            }

            setEntries(prev => [...prev, {
                type: 'result',
                data: result.data,
                format: result.format,
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
    }, [query]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey){
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    const handleGetUsers = async (args) => {
        const [room, from, to] = args;

        const data =[
            { username1: '', uid: 1000 },
            { username2: '', uid: 1001}

        ]

        return {
            data: data,
            format: 'user-list'
        };
    };

    const handleGetMessages = async (args) => {
        try {
            const [firstArg, ...rest] = args;

            const params = new URLSearchParams();

            if(firstArg === 'uname' && rest[0]){
                params.append('user-name', rest[0]);
            } else if(firstArg === 'uid' && rest[0]){
                params.append('user-id', rest[0]);
            } else if(firstArg === 'room' && rest[0]){
                params.append('room-name', rest[0]);
            }

            // assumed order of dates: from to
            const dateArgs = firstArg === 'uname' || firstArg === 'uid' || firstArg === 'room' ? rest.slice(1): args;

            if(dateArgs.length >= 1 && dateArgs[0]){
                params.append('start-date', dateArgs[0]);
            }
            if(dateArgs.length >= 2 && dateArgs[1]){
                params.append('end-date', dateArgs[1]);
            }

            const response = await fetch(`/api/messages?${params.toString()}`);

            if(!response.ok){
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch messages');
            }

            const result = await response.json();

            const data = result.messages.map(msg =>({ 
                timestamp: msg.timestamp,
                room: msg.room_name,
                username: msg.display_name,
                message: msg.msg_content
            }));

            return {
                data: data,
                format: 'message-list'
            };
        } catch (error) {
            throw new Error(`Failed to get messages: ${error.message}`);
        }
    };

    const handleGetSubs = async (args) => {
        const data = [
            {
                timestamp: '2026-01-15T10:30:00Z',
                username: 'username1',
                room: 'room1',
                type: 'tier'
            }
        ];

        return {
            data: data,
            format: 'sub-list'
        };
    };

    const handleGetGift = async (args) => {
        const data = [
            {
                timestamp: '2026-01-15T10:30:00Z',
                username: 'username1',
                room: 'room1',
                type: 'gift',
                amount: 5
            }
        ];
        return {
            data: data,
            format: 'gift-list'
        };
    };

    const handleGetAnnouncement = async (args) => {
        const data = [
            {
                timestamp: '2026-01-15T10:30:00Z',
                username: 'username1',
                room: 'room1',
                systemMessage: 'System message'
            }
        ];

        return {
            data: data,
            format: 'announcement-list'
        };
    };

    const handleGetBits = async (args) => {
        const data = [
            {
                timestamp: '2026-01-15T10:30:00Z',
                username: 'username1',
                room: 'room1',
                amount: 5
            }
        ];

        return {
            data: data,
            format: 'bits-list'
        };
    };

    const handleGetPayforward = async (args) => {
        const data = [
            {
                timestamp: '2026-01-15T10:30:00Z',
                username: 'username1',
                room: 'room1',
                type: 'communityPayforward',
                recipient: 'username2'
            }
        ];

        return {
            data: data,
            format: 'payforward-list'
        };
    };

    const handleGetPaidupgrade = async (args) => {
        const data = [
            {
                timestamp: '2026-01-15T10:30:00Z',
                username: 'username1',
                room: 'room1',
                type: 'paidUpgrade',
                recipient: 'username2'
            }
        ];

        return {
            data: data,
            format: 'paidupgrade-list'
        };
    };

    const handleGetOnetapgift = async (args) => {
        const data = [
            {
                timestamp: '2026-01-15T10:30:00Z',
                username: 'username1',
                room: 'room1',
                type: 'tier',
            }
        ];

        return {
            data: data,
            format: 'onetapgift-list'
        };
    };

    const handleHelp = (args) => {
        const commands = {
            'clear': {
                syntax: 'clear',
                description: 'Clear the terminal screen'
            },
            'get users': {
                syntax: 'get users [room] [from] [to]',
                description: ''
            },
            'get messages': {
                syntax: 'get messages [uname|uid|room] [room] [from] [to]',
                description: ''
            },
            'get subs': {
                syntax: 'get subs [room|uname|uid] [room] [from] [to]',
                description: '' 
            },
            'get gift': {
                syntax: 'get gift [uname|uid|room] [room] [from] [to]',
                description: ''
            },
            'get announcement': {
                syntax: 'get announcement [uname|uid|room] [room] [from] [to]',
                description: ''
            },
            'get bits': {
                syntax: 'get bits [uname|uid|room] [room] [from] [to]',
                description: ''
            },
            'get payforward': {
                syntax: 'get payforward [uname|uid|room] [from] [to]',
                description: ''
            },
            'get paidupgrade': {
                syntax: 'get paidupgrade [uname|uid] [room] [from] [to]',
                description: ''
            },
            'get onetapgift': {
                syntax: 'get onetapgift [uname|uid] [room] [from] [to]',
                description: ''
            },
            'help': {
                syntax: 'help [cmd]',
                description: ''
            }
        };

        if (args.length > 0) {
            const cmd = args.join(' ');
            const cmdInfo = commands[cmd]
            if(cmdInfo){
                return {
                    data: [cmdInfo],
                    format: 'help-single'
                };
            } else {
                throw new Error(`Unknown command: ${cmd}`);
            }
        } else {
            return {
                data: Object.entries(commands).map(([cmd, info]) => ({
                    command: cmd,
                    ...info
                })),
                format: 'help-all'
            };
        }
    };

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
                                data-index={virtualItem.index}
                                ref={virtualizer.measureElement}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualItem.start}px)`
                                }}
                                className={`terminal-line ${entry.type}`}
                            >
                                {entry.timestamp && (
                                    <span className="timestamp">
                                        [{new Date(entry.timestamp).toLocaleTimeString()}]
                                    </span>
                                )}
                                {entry.data ? (
                                    <div>
                                        {renderFormattedData(entry.data, entry.format)}
                                    </div>
                                ) : (
                                    <pre>{entry.text}</pre>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {loading && <div className="terminal-line loading">Loading...</div>}

            <TerminalInput
                query={query}
                setQuery={setQuery}
                handleSubmit={handleSubmit}
                handleKeyDown={handleKeyDown}
                loading={loading}
            />
        </div>
    );
}
export default TerminalView;