export const createCommandExecutor = (handlers, setPaginationState) => {
    return async (cmd, args) => {
        let result;

        switch(cmd){

            case 'get announcements':
                result = await handlers.handleGetAnnouncements(args, 0);
                setPaginationState({
                    hasMore: result.data.length === 500,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: 'get announcements',
                    lastArgs: args
                });
                break;

            case 'get bits':
                result = await handlers.handleGetBits(args, 0);
                setPaginationState({
                    hasMore: result.data.length === 500,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: 'get bits',
                    lastArgs: args
                });
                break;

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
                result = await handlers.handleConnect(args);
                setPaginationState({
                    hasMore: false,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: null,
                    lastArgs: null
                });
                break;

            case 'disconnect':
                result = handlers.handleDisconnect();
                break;

            case 'get gifts':
                result = await handlers.handleGetGifts(args, 0);
                setPaginationState({
                    hasMore: result.data.length === 500,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: 'get gifts',
                    lastArgs: args
                });
                break;

            case 'get messages':
                result = await handlers.handleGetMessages(args, 0);
                setPaginationState({
                    hasMore: result.data.length === 500,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: 'get messages',
                    lastArgs: args
                });
                break;

            case 'get onetapgifts':
                result = await handlers.handleGetOnetapgifts(args, 0);
                setPaginationState({
                    hasMore: result.data.length === 500,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: 'get onetapgifts',
                    lastArgs: args
                });
                break;

            case 'get paidupgrades':
                result = await handlers.handleGetPaidupgrades(args, 0);
                setPaginationState({
                    hasMore: result.data.length === 500,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: 'get paidupgrades',
                    lastArgs: args
                });
                break;

            case 'get payforwards':
                result = await handlers.handleGetPayforwards(args, 0);
                setPaginationState({
                    hasMore: result.data.length === 500,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: 'get payforwards',
                    lastArgs: args
                });
                break;

            case 'get rooms':
                result = await handlers.handleGetRooms(args, 0);
                setPaginationState({
                    hasMore: result.data.length === 500,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: 'get rooms',
                    lastArgs: args
                });
                break;

            case 'get subs':
                result = await handlers.handleGetSubs(args, 0);
                setPaginationState({
                    hasMore: result.data.length === 500,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: 'get subs',
                    lastArgs: args
                });
                break;

            case 'get user':
                result = await handlers.handleGetUser(args);
                setPaginationState({
                    hasMore: false,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: null,
                    lastArgs: null
                });
                break;

            case 'get users':
                result = await handlers.handleGetUsers(args, 0);
                setPaginationState({
                    hasMore: false,
                    isLoadingMore: false,
                    currentOffset: 0,
                    lastCommand: null,
                    lastArgs: null
                });
                break;

            case 'help':
                result = await handlers.handleHelp(args);
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

        return result;
    };
};