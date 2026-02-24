export const createDisconnectHandler = (setBackendURL, setEntries, setPaginationState) => {
    return async () => {

        sessionStorage.removeItem('backendURL');
        setBackendURL(null);

        setEntries([]);

        setPaginationState({
            hasMore: false,
            isLoadingMore: false,
            currentOffset: 0,
            lastCommand: null,
            lastArgs: null
        });

        return {
            data: [{
                message: 'Disconnected. All session data cleared.'
            }],
            format: 'connection-status'
        };
    };
};