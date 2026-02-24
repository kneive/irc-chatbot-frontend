export const createConnectHandler = (setBackendURL) => {

    return async (args) => {

        if(args.length === 0){
            throw new Error('Syntax error: Use connect <http://url:port> or connect <http://ip:port');
        }

        let url = args[0];

        if(!url.startsWith('http://') && !url.startsWith('https://')){
            url = `http://${url}`;
        }

        try {
            new URL(url)
        } catch(error) {
            throw new Error(`Syntax error - invalid URL format: http://host:port or http://ip:port `)
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
    };
}