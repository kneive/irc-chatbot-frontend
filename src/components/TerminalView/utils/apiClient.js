export const createAPIClient = (backendURL) => {

    const getAPIURL = (path) => {
        const base = backendURL || '';
        return `${base}${path}`;
    };

    const fetchAPI = async (endpoint, params = {}) =>{
        if (!backendURL) {
            throw new Error('Not connected to backend. Use: connect <url:port> or connect <ip:port>');
        }

        const queryParams = new URLSearchParams(params);
        const response = await fetch(getAPIURL(`${endpoint}?${queryParams.toString()}`));

        if(!response.ok){
            const error = await response.json();
            throw new Error(error.message || `Failed to fetch from ${endpoint}`);
        }

        return await response.json();
    };

    return { fetchAPI, getAPIURL };
};

export const parseCommandArgs = (args) => {
    
    const params = {};

    for(let i = 0; i < args.length; i++) {
        const arg = args[i];

        if(arg === '-r' || arg === '--room'){
            if(args[i+1]){
                params['room-name'] = args[i+1];
                i++;
            }
        } else if(arg === '-u' || arg === '--username'){
            if(args[i+1]){
                params['user-name'] = args[i+1];
                i++;
            }
        } else if(arg === '-rid' || arg === '--room-id'){
            if(args[i+1]){
                params['room-id'] = args[i+1];
                i++;
            }
        } else if(arg === '-uid' || arg === '--user-id'){
            if(args[i+1]){
                params['user-id'] = args[i+1];
                i++;
            }
        } else if(arg === '-from'){
            if(args[i+1]){
                params['start-date'] = args[i+1];
                i++;
            }
        } else if(arg === '-to'){
            if(args[i+1]){
                params['end-date'] = args[i+1];
            }
        }
    }

    return params;
};

export function isInteger(value){
    return /^\d+$/.test(value);
}