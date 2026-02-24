import { parseCommandArgs } from '../utils/apiClient';

export const createGetSubsHandler = (apiClient) => {
    return async (args, offset=0) => {
        try{
            const params = parseCommandArgs(args);

            params.limit = '500';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/subscriptions/', params);

            console.log('API Response', result);
            console.log('Subscription count:', result.data?.length);

            const data = result.data.map(sub =>({
                timestamp: sub.timestamp,
                username: sub.display_name,
                room: sub.room_name,
                type: sub.sub_plan
            }));

            console.log('Formatted Subscriptions@', data);

            return {
                data:data,
                format: 'sub-list'
            };
        } catch(error){
            throw new Error(`Failed to get subscriptions: ${error.message}`);
        }
    };
};