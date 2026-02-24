import { parseCommandArgs } from '../utils/apiClient';

export const createGetOnetapgiftHandler = (apiClient) => {

    return async(args, offset = 0) => {

        try {

            const params = parseCommandArgs(args);

            params.limit = '500';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/onetapgifts', params);

            console.log('API Response: ', result);
            console.log('Onetapgift count: ', result.data?.length);

            const data = result.data.map(onetapgift => ({
                timestamp: onetapgift.timestamp,
                username: onetapgift.display_name,
                room: onetapgift.room_name,
                systemMessage: onetapgift.system_msg
            }));

            console.log('Formatted Onetapgifts: ', data);

            return {
                data: data,
                format: 'onetapgift-list'
            };
            
        } catch (error) {
            throw new Error(`Error fetching onetapgifts: ${error.message}`);
        }
    };
};