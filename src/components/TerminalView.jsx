import React, { useState, useEffect, useRef, useMemo, useCallback} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import './TerminalView.css';
import { resumeToPipeableStream } from 'react-dom/server';

function isInteger(value){
    return /^\d+$/.test(value);
}

const TerminalInput = React.memo(({ query, setQuery, handleSubmit, handleKeyDown, loading, inputRef }) => {
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

function TerminalView(){
    const [entries, setEntries] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const parentRef = useRef(null);
    
    // focus on input
    const inputRef = useRef(null);
    
    // history
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    // connection
    const[backendURL, setBackendURL] = useState(() => {
        return sessionStorage.getItem('backendURL') || null;
    });

    const [paginationState, setPaginationState] = useState({
        hasMore: false,
        isLoadingMore: false,
        currentOffset: 0,
        lastCommand: null,
        lastArgs: null
    });

    const fetchEntries = async () => {
        try {
            const url = backendURL ? getAPIURL('/api/'): '/api/';
            const response = await fetch(url);

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
        estimateSize: useCallback(() => 50, []),
        overscan: 5,
        measureElement: (element) => element.getBoundingClientRect().height,
    });

    const virtualItems = useMemo(() => virtualizer.getVirtualItems(), [virtualizer.getVirtualItems()]);
    const totalSize = useMemo(() => virtualizer.getTotalSize(), [virtualizer.getTotalSize()]);

    // Fetch initial data
    useEffect(() => {
        fetchEntries();
    }, []);

    // focus on input
    useEffect(() => {
        if(inputRef.current){
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if(!loading && inputRef.current){
            inputRef.current.focus();
        }
    }, [loading]);

    // load command history
    useEffect(() => {
        const saved = localStorage.getItem('terminalHistory');
        if(saved){
            try {
                setCommandHistory(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load history:', e);
            }
        }
    }, []);

    // save command history
    useEffect(() => {
        if (commandHistory.length > 0) {
            localStorage.setItem('terminalHistory', JSON.stringify(commandHistory));
        }
    }, [commandHistory]);

    // Auto-scroll to the bottom when entries are added
    useEffect(() => {
        if (entries.length > 0) {
            virtualizer.scrollToIndex(entries.length - 1, {
                align: 'end',
                behavior: 'smooth'
            });
        }
    }, [entries.length, virtualizer]);

    useEffect(() => {
        const scrollElement = parentRef.current;
        if (!scrollElement) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollElement;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            const threshold=200;

            if (distanceFromBottom < threshold && paginationState.hasMore && !paginationState.isLoadingMore) {
                loadMoreData();
            }
        };

        scrollElement.addEventListener('scroll', handleScroll);
        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [paginationState]);

    useEffect(() => {
        const handleResize = () => {
            virtualizer.measure();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [virtualizer]);

    const getAPIURL = (path) => {
        const base = backendURL || '';
        return `${base}${path}`;
    };

    const loadMoreData = async () => {
        if (!paginationState.hasMore || paginationState.isLoadingMore) {
            return;
        }

        setPaginationState(prev => ({ ... prev, isLoadingMore: true}));

        try {
            const nextOffset = paginationState.currentOffset + 500;

            const result = await executeCommand(
                paginationState.lastCommand,
                paginationState.lastArgs,
                nextOffset
            );

            if (result.data.length > 0) {
                
                const formattedItems = formatDataItems(result.data, result.format);
                
                setEntries(prev => [...prev, ...formattedItems]);

                setPaginationState(prev => ({
                    ...prev,
                    currentOffset: nextOffset,
                    hasMore: result.data.length === 500,
                    isLoadingMore: false
                }));
            }
        } catch (error) {
            console.error('Error loading more data:', error);
            setPaginationState(prev => ({ ...prev, isLoadingMore: false }));
        }
    };

    const executeCommand = async (command, args, offset) => {
        switch(command){
            case 'get messages':
                return await handleGetMessages(args, offset);
            case 'get user':
                return await handleGetUser(args);
            case 'get users':
                return await handleGetUsers(args, offset);
            case 'get subs':
                return await handleGetSubs(args, offset);
            case 'get gifts':
                return await handleGetGift(args, offset);
            case 'get announcements':
                return await handleGetAnnouncement(args, offset);
            case 'get bits':
                return await handleGetBits(args, offset);
            case 'get payforwards':
                return await handleGetPayforward(args, offset);
            case 'get paidupgrades':
                return await handleGetPaidupgrade(args, offset);
            case 'get onetapgifts':
                return await handleGetOnetapgift(args, offset);
            case 'help':
                return handleHelp(args);
            default:
                return { data: [], format: 'message-list' };
        }
    };

    const formatDataItems = (data, format) => {
        return data.flatMap((item, i) => {
            let content;
            let textLength = 0;

            // formatted content
            switch(format) {

                case 'connection-status':
                    const connectionText = item.message + (item.url ? ` (${item.url})` : '');
                    textLength = connectionText.length;
                    content = (
                        <>
                            <span className="status-message">{item.message}</span>
                            {item.url && (
                                <>
                                    {' '}
                                    <span className="url">({item.url})</span>
                                </>
                            )}
                        </>
                    );
                    break;

                case 'message-list':
                    const messageText = `${item.timestamp} ${item.room} ${item.username} : ${item.message}`;
                    textLength = messageText.length;
                    content = (
                        <>
                            <span className="timestamp">{item.timestamp}</span>
                            {' '}
                            <span className="room">{item.room}</span>
                            {' '}
                            <span className="username">{item.username}</span>
                            {' : '}
                            <span className="message">{item.message}</span>
                        </>
                    );
                    break;

                case 'user-list':
                    const userText = `${item.username} : ${item.uid}`;
                    textLength = userText.length; 
                    content = (
                        <>
                            <span className="username">{item.username}</span>
                            {' : '}
                            <span className="uid">{item.uid}</span>
                        </>
                    );
                    break;

                case 'sub-list':
                    const subText = `${item.timestamp} ${item.username} ${item.room} : ${item.type}`;
                    textLength = subText.length;
                    content = (
                        <>
                            <span className="timestamp">{item.timestamp}</span>
                            {' '}
                            <span className="username">{item.username}</span>
                            {' '}
                            <span className="room">{item.room}</span>
                            {' : '}
                            <span className="type">{item.type}</span>
                        </>
                    );
                    break;
                
                case 'gift-list':
                    const giftText = `${item.timestamp} ${item.username} ${item.room} : ${item.type} ${item.amount}`;
                    textLength = giftText.length;
                    content = (
                        <>
                            <span className="timestamp">{item.timestamp}</span>
                            {' '}
                            <span className="username">{item.username}</span>
                            {' '}
                            <span className="room">{item.room}</span>
                            {' : '}
                            <span className="type">{item.type}</span>
                            {' '}
                            <span className="amount">{item.amount}</span>
                        </>
                    );
                    break;

                case 'announcement-list':
                    const announcementText = `${item.timestamp} ${item.username} ${item.room} : ${item.systemMessage}`;
                    textLength = announcementText.length;
                    content = (
                        <>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="username">{item.username}</span>
                        {' '}
                        <span className="room">{item.room}</span>
                        {' : '}
                        <span className="system-message">{item.systemMessage}</span>
                        </>
                    );
                    break;

                case 'bits-list':
                    const bitsText = `${item.timestamp} ${item.username} ${item.room} : ${item.amount}`;
                    textLength = bitsText.length;
                    content = (
                        <>
                            <span className="timestamp">{item.timestamp}</span>
                            {' '}
                            <span className="username">{item.username}</span>
                            {' '}
                            <span className="room">{item.room}</span>
                            {' : '}
                            <span className="amount">{item.amount}</span>
                        </>
                    );
                    break;

                case 'payforward-list':
                    const payforwardText = `${item.timestamp} ${item.gifter} (gifter) ${item.prior} (prior gifter) ${item.recipient} (recipient) ${item.room} : ${item.systemMessage}`;
                    textLength = payforwardText.length;
                    content = (
                        <>
                            <span className="timestamp">{item.timestamp}</span>
                            {' '}
                            <span className="gifter">{item.gifter} (gifter)</span>
                            {' '}
                            <span className="prior">{item.prior} (prior gifter)</span>
                            {' '}
                            <span className="recipient">{item.recipient} (recipient)</span>
                            {' '}
                            <span className="room">{item.room}</span>
                            {' : '}
                            <span className="system-message">{item.systemMessage}</span>
                        </>
                    );
                    break;

                case 'paidupgrade-list':
                    const paidupgradeText = `${item.timestamp} ${item.sender} (sender) ${item.recipient} (recipient) ${item.room} : ${item.type}`;
                    textLength = paidupgradeText.length;
                    content = (
                        <>
                            <span className="timestamp">{item.timestamp}</span>
                            {' '}
                            <span className="sender">{item.sender} (sender)</span>
                            {' '}
                            <span className="recipient">{item.recipient} (recipient)</span>
                            {' '}
                            <span className="room">{item.room}</span>
                            {' : '}
                            <span className="type">{item.type}</span>
                        </>
                    );
                    break;
                
                case 'onetapgift-list':
                    const onetapgiftText = `${item.timestamp} ${item.username} ${item.room} : ${item.systemMessage}`;
                    content = (
                        <>
                            <span className="timestamp">{item.timestamp}</span>
                            {' '}
                            <span className="username">{item.username}</span>
                            {' '}
                            <span className="room">{item.room}</span>
                            {' : '}
                            <span className="system-message">{item.systemMessage}</span>
                        </>
                    );
                    break;

                case 'help-all':
                    const commandRow = ` ${item.command}`;
                    const syntaxRow = `   Syntax: ${item.syntax}`;
                    const descRow = `   Description: ${item.description}`;
                    
                    // Return array of 3 entries
                    return [
                        {
                            type: 'result',
                            content: <span className="help-command"> {item.command}</span>,
                            textLength: commandRow.length,
                            timestamp: new Date().toISOString()
                        },
                        {
                            type: 'result',
                            content: (
                                <>
                                    <span className="label">   Syntax: </span>
                                    <span className="help-syntax">{item.syntax}</span>
                                </>
                            ),
                            textLength: syntaxRow.length,
                            timestamp: new Date().toISOString()
                        },
                        {
                            type: 'result',
                            content: (
                                <>
                                    <span className="label">   Description: </span>
                                    <span className="help-description">{item.description}</span>
                                </>
                            ),
                            textLength: descRow.length,
                            timestamp: new Date().toISOString()
                        }
                    ];
                    break;

                default:
                    content = <pre>{JSON.stringify(item, null, 2)}</pre>;
            }
            
            return {
                type: 'result',
                content: content,
                textLength: textLength,
                timestamp: new Date().toISOString()
            };
        });
    };


    const handleConnect = async(args) => {

        if (args.length === 0) {
            throw new Error('Syntax error: The correct syntax is connect <url:port> or connect <ip:port>');
        }

        let url = args[0];

        if (!url.startswith('http://') && !url.startsWith('https://')){
            url = `http://${url}`;
        }

        try {

            new URL(url);
        
        } catch (error) {

            throw new Error('Syntax error - invalid URL format: http://host:port or https://host.port')
        }

        try {

            const response = await fetch(`${url}/api/`);
            if(!response.ok){
                throw new Error(`Server responded with status ${response.status}`);
            }

            const data = await response.json();

            sessionStorage.setItem('backendURL', url);
            setBackendURL(url);

            return {
                data: [{
                    message: `Connected to ${data.message || 'backend'} ${data.version ? 'v' + data.version : ''}`,
                    url: url
                }],
                format: 'connection-status'
            };

        } catch (error) {

            throw new Error(`Failed to connect to ${url}: ${error.message}`);
        }
    } 

    const handleDisconnect = () => {

        sessionStorage.removeItem('backendURL');
        setBackendURL(null);

        setEntries([]);

        setPaginationState({
            hasMore: false,
            isLoadingMore:false,
            currentOffset: 0,
            lastCommand: null,
            lastArgs: null
        });

        return {
            data: [{
                message: 'Disconnected. All Session data cleared.'
            }],
            format: 'connection-status'
        };
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);

        // append command history
        setCommandHistory(prev => {
            if(prev[0] === query) {
                return prev;
            }
            return [query, ...prev].slice(0,256);
        });
        setHistoryIndex(-1);

        setEntries(prev => [...prev, { type: 'query', text: `> ${query}`}]);

        try {
            const command = query.trim().toLowerCase();
            const parts = command.split(' ');

            const oneWord = parts[0];
            const twoWords = parts.slice(0, 2).join(' ');

            let cmd, args;

            if (['connect', 'disconnect', 'clear', 'help'].includes(oneWord)){
                cmd = oneWord;
                args = parts.slice(1);
            } else {
                cmd = twoWords;
                args = parts.slice(2);
            }

            let result;

            switch(cmd){
                case 'clear': 
                    setEntries([]);
                    setQuery('');
                    setPaginationState({
                        hasMore: false,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: null,
                        lastArgs: null
                    });
                    return;

                case 'connect':
                    result = await handleConnect(args);
                    setPaginationState({
                        hasMore: false,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: null,
                        lastArgs: null
                    });
                    break;

                case 'disconnect':
                    result = handleDisconnect();
                    break;

                case 'get user':
                    result = await handleGetUser(args);
                    setPaginationState({
                        hasMore: false,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: null,
                        lastArgs: null
                    });
                    break;

                case 'get users':
                    result = await handleGetUsers(args, 0);
                    setPaginationState({
                        hasMore: false,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: null,
                        lastArgs: null
                    });
                    break;

                case 'get messages':
                    result = await handleGetMessages(args, 0);
                    setPaginationState({
                        hasMore: result.data.length === 500,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: 'get messages',
                        lastArgs: args
                    });
                    break;

                case 'get subs':
                    result = await handleGetSubs(args, 0);
                    setPaginationState({
                        hasMore: result.data.length === 500,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: 'get subs',
                        lastArgs: args
                    });
                    break;

                case 'get gifts':
                    result = await handleGetGift(args, 0);
                    setPaginationState({
                        hasMore: result.data.length === 500,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: 'get gifts',
                        lastArgs: args
                    });
                    break;

                case 'get announcements':
                    result = await handleGetAnnouncement(args, 0);
                    setPaginationState({
                        hasMore: result.data.length === 500,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: 'get announcements',
                        lastArgs: args
                    });
                    break;

                case 'get bits':
                    result = await handleGetBits(args, 0);
                    setPaginationState({
                        hasMore: result.data.length === 500,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: 'get bits',
                        lastArgs: args
                    });
                    break;

                case 'get payforwards':
                    result = await handleGetPayforward(args, 0);
                    setPaginationState({
                        hasMore: result.data.length === 500,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: 'get payforwards',
                        lastArgs: args
                    });
                    break;

                case 'get paidupgrades':
                    result = await handleGetPaidupgrade(args, 0);
                    setPaginationState({
                        hasMore: result.data.length === 500,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: 'get paidupgrades',
                        lastArgs: args
                    });
                    break;

                case 'get onetapgifts':
                    result = await handleGetOnetapgift(args, 0);
                    setPaginationState({
                        hasMore: result.data.length === 500,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: 'get onetapgifts',
                        lastArgs: args
                    });
                    break;

                case 'help':
                    result = await handleHelp(args);
                    setPaginationState({
                        hasMore: false,
                        isLoadingMore: false,
                        currentOffset: 0,
                        lastCommand: null,
                        lastArgs: null
                    });
                    break;

                default:
                    throw new Error(`Unknown command: ${cmd}`);
            }

            const formattedItems = formatDataItems(result.data, result.format);

            setEntries(prev => [...prev, ...formattedItems]);

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
        } else if (e.key === 'ArrowUp'){
            e.preventDefault();
            if(commandHistory.length > 0){
                const newIndex = Math.min(historyIndex +1, commandHistory.length - 1);
                setHistoryIndex(newIndex);
                setQuery(commandHistory[newIndex]);
            }
        } else if(e.key === 'ArrowDown'){
            e.preventDefault();
            if(historyIndex > 0){
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setQuery(commandHistory[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setQuery('');
            }
        }

    }, [handleSubmit, commandHistory, historyIndex]);

    const handleGetUser = async (args) => {
        try {

            if(!backendURL){
                throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
            }

            const param = new URLSearchParams();

            if (args.length === 0) {
                throw new Error('No user ID or username provided');
            }
            if (isInteger(args[0])){
                param.append('user-id', args[0]);
            } else {
                param.append('user-name', args[0]);
            }

            const response = await fetch(getAPIURL(`/api/users/single?${param.toString()}`));

            if(!response.ok){
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch user');
            }

            const user = await response.json();

            console.log('API Response:', user);

            if (!user.display_name && user.user_id === 0){
                throw new Error('User not found');
            }

            return {
                data: [{
                    username: user.display_name,
                    uid: user.user_id
                }],
                format: 'user-list'
            };

        } catch (error){
            throw new Error(`Failed to get user: ${error.message}`);
        }

    };

    const handleGetUsers = async (args, offset = 0) => {
        try {

            if(!backendURL){
                throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
            }

            const params = new URLSearchParams();

            if(args.length > 0 && args[0]){
                params.append('room-name', args[0]);
            }

            params.append('limit', '500');
            params.append('offset', offset.toString());

            const response = await fetch(getAPIURL(`/api/users?${params.toString()}`));

            if(!response.ok){
                const error = await  response.json();
                throw new Error(error.message || 'Failed to fetch users');
            }

            const result = await response.json();

            console.log('API Response:', result);
            console.log('Users count:', result.users?.length);

            const data = result.users.map(user => ({
                username: user.display_name,
                uid: user.user_id
            }));

            console.log('Formatted data:', data);

            return {
                data: data,
                format: 'user-list'
            };

        } catch (error) {
            throw new Error(`Failed to get users: ${error.message}`);
        }
    };

    const handleGetMessages = async (args, offset = 0) => {
        try {

            if(!backendURL){
                throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
            }

            const params = new URLSearchParams();

            for (let i = 0; i < args.length; i++){
                const arg = args[i];

                if(arg === '-r' || arg === '--room'){
                    if(args[i+1]){
                        params.append('room-name', args[i+1]);
                        i++;
                    }
                } else if (arg === '-u' || arg === '--username'){
                    if(args[i+1]){
                        params.append('user-name', args[i+1]);
                        i++;
                    }
                } else if (arg === '-rid' || arg === '--room-id'){
                    if(args[i+1]){
                        params.append('room-id', args[i+1]);
                        i++;
                    }
                } else if (arg === '-uid' || arg === '--user-id'){
                    if(args[i+1]){
                        params.append('user-id', args[i+1]);
                        i++
                    }
                } else if (arg === '--from'){
                    if(args[i+1]){
                        params.append('start-date', args[i+1]);
                        i++;
                    }
                } else if (arg === '--to'){
                    if(args[i+1]){
                        params.append('end-date', args[i+1]);
                        i++;
                    }
                }
            }

            params.append('limit', '500');
            params.append('offset', offset.toString());

            const response = await fetch(getAPIURL(`/api/messages?${params.toString()}`));

            if(!response.ok){
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch messages');
            }

            const result = await response.json();

            console.log('API Response:', result);
            console.log('Messages count:', result.messages?.length);

            const data = result.messages.map(msg =>({ 
                timestamp: msg.timestamp,
                room: msg.room_name,
                username: msg.display_name,
                message: msg.msg_content
            }));

            console.log('Formatted data:', data);

            return {
                data: data,
                format: 'message-list'
            };
        } catch (error) {
            throw new Error(`Failed to get messages: ${error.message}`);
        }
    };

    const handleGetSubs = async (args, offset = 0) => {
        try {

            if(!backendURL){
                throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
            }

            const params = new URLSearchParams();

            for(let i = 0; i < args.length; i++){
                const arg = args[i];
                if(arg === '-r' || arg === '--room'){
                    if(args[i+1]){
                        params.append('room-name', args[i+1]);
                        i++;
                    }
                } else if(arg === '-u' || arg === '--username'){
                    if(args[i+1]){
                        params.append('user-name', args[i+1]);
                        i++;
                    }
                } else if(arg === '-rid' || arg === '--room-id'){
                    if(args[i+1]){
                        params.append('room-id', args[i+1]);
                        i++;
                    }
                } else if(arg === '-uid' || arg === '--user-id'){
                    if(args[i+1]){
                        params.append('user-id', args[i+1]);
                        i++;
                    }
                } else if (arg === '--from'){
                    if(args[i+1]){
                        params.append('start-date', args[i+1]);
                        i++;
                    }
                } else if(arg === '--to'){
                    if(args[i+1]){
                        params.append('end-date', args[i+1]);
                        i++;
                    }
                }
            }

            params.append('limit', '500');
            params.append('offset', offset.toString());

            const response = await fetch(getAPIURL(`/api/subscriptions?${params.toString()}`));

            if(!response.ok){
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch subscriptions');
            }

            const result = await response.json();

            console.log('API Response:', result);
            console.log('Subscriptions count:', result.subscriptions?.length);

            const data = result.subscriptions.map(sub => ({
                timestamp: sub.timestamp,
                username: sub.display_name,
                room: sub.room_name,
                type: sub.sub_plan
            }));

            console.log('Formatted data:', data);

            return {
                data: data,
                format: 'sub-list'
            };
            
        } catch (error) {
            throw new Error(`Failed to get subs: ${error.message}`);
        }
    };

    const handleGetGift = async (args, offset = 0) => {
        try {

            if(!backendURL){
                throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
            }

            const params = new URLSearchParams();

            for(let i = 0; i<args.length; i++){
                const arg = args[i];
                if(arg === '-r' || arg === '--room'){
                    if(args[i+1]){
                        params.append('room-name', args[i+1])
                        i++;
                    }
                } else if(arg === '-u' || arg === '--username'){
                    if(args[i+1]){
                        params.append('user-name', args[i+1]);
                        i++;
                    }
                } else if(arg === 'rid' || arg === '--room-id'){
                    if(args[i+1]){
                        params.append('room-id', args[i+1]);
                        i++;
                    }
                } else if(arg === '-uid' || arg === '--user-id'){
                    if(args[i+1]){
                        params.append('user-id', args[i+1]);
                        i++;
                    }
                } else if (arg === '--from'){
                    if(args[i+1]){
                        params.append('start-date', args[i+1]);
                        i++;
                    }
                } else if(arg === '--to'){
                    if(args[i+1]){
                        params.append('end-date', args[i+1]);
                        i++;
                    }
                }
            }

            params.append('limit', '500');
            params.append('offset', offset.toString());

            const response = await fetch(getAPIURL(`/api/mysterygifts?${params.toString()}`));

            if(!response.ok){
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch mystery gifts');
            }

            const result = await response.json();

            console.log('API Response:', result);
            console.log('Mystery Gift count:', result.mystery_gifts?.length)

            const data = result.mystery_gifts.map(gift =>({
                timestamp: gift.timestamp,
                username: gift.display_name,
                room: gift.room_name,
                type: gift.sup_plan,
                amount: gift.mass_gift_count
            }));

            console.log('Formatted data:', data);

            return {
                data: data,
                format: 'gift-list'
            };

        } catch (error) {
            throw new Error(`Failed to get gift data: ${error.message}`);
        }
    };

    const handleGetAnnouncement = async (args, offset = 0) => {
        try {

            if(!backendURL){
                throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
            }

            const params = new URLSearchParams();

            for(let i = 0; i < args.length; i++){
                const arg = args[i];

                if(arg === '-r' || arg === '--room'){
                    if(args[i+1]){
                        params.append('room-name', args[i+1]);
                        i++;
                    }
                } else if(arg === '-u' || arg === '--username'){
                    if(args[i+1]){
                        params.append('user-name', args[i+1]);
                        i++;
                    }
                } else if(arg === '-rid' || arg === '--room-id'){
                    if(args[i+1]){
                        params.append('room-id', args[i+1]);
                        i++;
                    }
                } else if(arg === '-uid' || arg === '--user-id'){
                    if(args[i+1]){
                        params.append('user-id', args[i+1]);
                        i++;
                    }
                } else if(arg === '--from'){
                    if(args[i+1]){
                        params.append('start-date', args[i+1]);
                        i++;
                    }
                } else if(arg === '--to'){
                    if(args[i+1]){
                        params.append('end-date', args[i+1]);
                        i++;
                    }
                }
            }

            params.append('limit', '500');
            params.append('offset', offset.toString());

            const response = await fetch(getAPIURL(`/api/announcements?${params.toString()}`));

            if(!response.ok){
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch announcements');
            }

            const result = await response.json();

            console.log('API Response:', result);
            console.log('Announcements count:', result.announcements?.length);

            const data = result.announcements.map(announcement => ({
                timestamp: announcement.timestamp,
                username: announcement.display_name,
                room: announcement.room_name,
                systemMessage: announcement.msg_content
            }));

            console.log('Formatted data:', data);
            
            return {
                data: data,
                format: 'announcement-list'
            };

        } catch (error) {
            throw new Error(`Failed to get announcement data: ${error.message}`);
        }
    };

    const handleGetBits = async (args, offset = 0) => {
        try{

            if(!backendURL){
                throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
            }

            const params = new URLSearchParams();

            for(let i = 0; i < args.length; i++){
                const arg = args[i];

                if(arg === '-r' || arg === '--room'){
                    if(args[i+1]){
                        params.append('room-name', args[i+1]);
                        i++;
                    }
                } else if(arg === '-u' || arg === '--username'){
                    if(args[i+1]){
                        params.append('user-name', args[i+1]);
                        i++;
                    }
                } else if(arg === '-rid' || arg === '--room-id'){
                    if(args[i+1]){
                        params.append('room-id', args[i+1]);
                        i++;
                    }
                } else if(arg === '-uid' || arg === '--user-id'){
                    if(args[i+1]){
                        params.append('user-id', args[i+1]);
                        i++;
                    }
                } else if (arg === '--from'){
                    if(args[i+1]){
                        params.append('start-date', args[i+1]);
                        i++;
                    }
                } else if(arg === '--to'){
                    if(args[i+1]){
                        params.append('end-date', args[i+1]);
                        i++;
                    }
                }
            }

            params.append('limit', '500');
            params.append('offset', offset.toString());

            const response = await fetch(getAPIURL(`/api/bits?${params.toString()}`));

            if(!response.ok){
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch bits data');
            }

            const result = await response.json();

            console.log('API Response:', result);
            console.log('Bits count:', result.bits?.length);

            const data = result.data.map(bit => ({
                timestamp: bit.timestamp,
                username: bit.display_name,
                room: bit.room_name,
                amount: bit.amount
            }));

            console.log('Formatted data:', data);

            return {
                data: data,
                format: 'bits-list'
            };

        } catch (error){
            throw new Error(`Failed to get bits data: ${error.message}`)
        }
    };

    const handleGetPayforward = async (args, offset = 0) => {
        
        try {

            if(!backendURL){
                throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
            }

            const params = new URLSearchParams();

            for(let i = 0; i < args.length; i++) {
                const arg = args[i];

                if (arg === '-r' || arg === '--room'){
                    if(args[i+1]){
                        params.append('room-name', args[i+1]);
                        i++;
                    }
                } else if (arg === '-u' || arg === '--username'){
                    if(args[i+1]){
                        params.append('user-name', args[i+1]);
                        i++;
                    }
                } else if (arg === '-rid' || args === '--room-id'){
                    if(args[i+1]){
                        params.append('room-id', args[i+1]);
                        i++;
                    }
                } else if (arg === '-uid' || arg === '--user-id'){
                    if(args[i+1]){
                        params.append('user-id', args[i+1]);
                        i++;
                    }
                } else if (arg === '-from'){
                    if(args[i+1]){
                        params.append('start-date', args[i+1]);
                        i++;
                    }
                } else if (arg === '-to'){
                    if(args[i+1]){
                        params.append('end-date', args[i+1]);
                        i++;
                    }
                }

                params.append('limit', '500');
                params.append('offset', offset.toString());

                const response = await fetch(getAPIURL(`/api/payforwards?${params.toString()}`));

                if(!response.ok){
                    const error = await response.json();
                    throw new Error(error.message || 'failed to fetch payforward data');
                }

                const result = await response.json();

                console.log('API Response:', result);
                console.log('Payforward count:', result.payforwards?.length);

                const data = result.payforwards.map(payforward => ({
                    timestamp: payforward.timestamp,
                    gifter: payforward.display_name,
                    room: payforward.room_name,
                    systemMessage: payforward.system_msg,
                    prior: payforward.prior_gifter_display_name,
                    recipient: payforward.recipient_display_name
                }));

                console.log('Formatted data:', data);

                return {
                    data: data,
                    format: 'payforward-list'
                }
            }

        } catch (error) {
            throw new Error(`Failed to get payforward data: ${error.message}`);
        }
    };

    const handleGetPaidupgrade = async (args, offset = 0) => {
        try {

            if(!backendURL){
                throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
            }

            const params = new URLSearchParams();

            for(let i = 0; i < args.length; i++){
                const arg = args[i];

                if(args === '-r' || arg === '--room'){
                    if(args[i+1]){
                        params.append('room-name', args[i+1]);
                        i++;
                    }
                } else if (arg === '-u' || arg === '--username'){
                    if(args[i=1]){
                        params.append('user-name', args[i+1]);
                        i++;
                    }
                } else if(arg === '-rid' || arg === '--room-id'){
                    if(args[i=1]){
                        params.append('room-id', args[i+1]);
                        i++;
                    }
                } else if(arg === '-uid' || arg === '--user-id'){
                    if(args[i+1]){
                        params.append('user-id', args[i+1]);
                        i++;
                    }
                } else if(arg === '-from'){
                    if(args[i=1]){
                        params.append('start-date', args[i+1]);
                        i++;
                    }
                } else if(arg === '-to'){
                    if(args[i+1]){
                        params.append('end-date', args[i+1]);
                        i++;
                    }
                }

                params.append('limit', '500');
                params.append('offset', offset.toString());

                const response = await fetch(getAPIURL(`/api/paidupgrades?${params.toString()}`));

                if(!response.ok){
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to fetch paidupgrade data');
                }

                const result = await response.json();

                console.log('API Response:', result);
                console.log('Paidupgrade count:', result.paidupgrades?.length);

                const data = result.paidupgrades.map(paidupgrade => ({
                    timestamp: paidupgrade.timestamp,
                    sender: paidupgrade.sender_name,
                    recipient: paidupgrade.display_name,
                    room: paidupgrade.room_name,
                    type: paidupgrade.sub_plan
                }));

                console.log('Formatted data:', data);

                return {
                    data: data,
                    format: 'paidupgrade-list'
                }
            }

        } catch (error) {
            throw new Error(`failed to get paidupgrade data: ${error.message}`);
        }
    };

    const handleGetOnetapgift = async (args, offset = 0) => {
        
        try {

            if(!backendURL){
                throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
            }

            const params = new URLSearchParams();

            for(let i = 0; i < args.length; i++){
                const arg = args[i];

                if(arg === '-r' || arg === '--room'){
                    if(args[i+1]){
                        params.append('room-name', args[i+1]);
                        i++;
                    }
                } else if(arg === '-u' || arg === '--username'){
                    if(args[i+1]){
                        params.append('user-name', args[i+1]);
                        i++;
                    }
                } else if(arg === '-rid' || arg === '--room-id'){
                    if(args[i+1]){
                        params.append('room-id', args[i+1]);
                        i++;
                    }
                } else if(arg === '-uid' || arg === '--user-id'){
                    if(args[i+1]){
                        params.append('user-id', args[i+1]);
                        i++;
                    }
                } else if(arg === '-from'){
                    if(args[i+1]){
                        params.append('start-date', args[i+1]);
                        i++;
                    }
                } else if(arg === '-to'){
                    if(args[i+1]){
                        params.append('end-date', args[i+1]);
                        i++;
                    }
                }

                params.append('limit', '500');
                params.append('offset', offset.toString());

                const response = await fetch(getAPIURL(`/api/onetapgifts?${params.toString()}`));

                if(!response.ok){
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to fetch onetapgift data');
                }

                const result = await response.json();

                console.log('API Response:', result);
                console.log('Onetapgift count:', result.onetapgifts?.length);

                const data = result.onetapgifts.map(onetapgift =>({
                    timestamp: onetapgift.timestamp,
                    username: onetapgift.display_name,
                    room: onetapgift.room_name,
                    systemMessage: onetapgift.system_msg
                }));

                console.log('Formatted data:', data);

                return {
                    data: data,
                    format: 'onetapgift-list'
                }
            }

        } catch (error) {
            throw new Error(`Failed to get onetapgift data: ${error.message}`);
        }
    };

    const handleHelp = (args) => {
        const commands = {
            'clear': {
                syntax: 'clear',
                description: 'Clear the terminal screen'
            },
            'connect' : {
                syntax: 'connect [<url:port>|<ip:port>]',
                description: 'Connect to a backend server.'
            },
            'disconnect': {
                syntax: 'disconnect',
                description: 'Disconnect from a backend server.'
            },
            'get user': {
                syntax: 'get user [uname|user-id]',
                description: 'Fetch information about a specific user by username or user ID'
            },
            'get users': {
                syntax: 'get users [room|room-id]',
                description: ''
            },
            'get messages': {
                syntax: 'get messages [uname|user-id] [room|room-id] [from] [to]',
                description: ''
            },
            'get subs': {
                syntax: 'get subs [uname|user-id] [room|room-id] [from] [to]',
                description: '' 
            },
            'get gifts': {
                syntax: 'get gifts [uname|user-id] [room|room-id] [from] [to]',
                description: ''
            },
            'get announcements': {
                syntax: 'get announcements [uname|user-id] [room|room-id] [from] [to]',
                description: ''
            },
            'get bits': {
                syntax: 'get bits [uname|user-id] [room|room-id] [from] [to]',
                description: ''
            },
            'get payforwards': {
                syntax: 'get payforward [uname|user-id] [room|room-id] [from] [to]',
                description: ''
            },
            'get paidupgrades': {
                syntax: 'get paidupgrade [uname|user-id] [room|room-id] [from] [to]',
                description: ''
            },
            'get onetapgifts': {
                syntax: 'get onetapgift [uname|user-id] [room|room-id] [from] [to]',
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