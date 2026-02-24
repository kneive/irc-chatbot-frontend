import { useState, useEffect } from 'react';

export const useBackendConnection = () => {
    const [backendURL, setBackendURL] = useState(() => {
        return sessionStorage.getItem('backendURL') || null;
    });

    useEffect(() => {
        if(backendURL){
            sessionStorage.setItem('backendURL', backendURL);
        } else {
            sessionStorage.removeItem('backendURL');
        }
    }, [backendURL]);

    const getAPIURL = (path) => {
        const base = backendURL || '';
        return `${base}${path}`;
    };

    return {
        backendURL,
        setBackendURL,
        getAPIURL
    };
};