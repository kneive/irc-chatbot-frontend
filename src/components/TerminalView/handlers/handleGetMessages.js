import { parseCommandArgs } from '../utils/apiClient';

export const createGetMessagesHandler = (apiClient) => {

    return async (args, offset = 0) => {

        try{
            const params = parseCommandArgs(args);

            params.limit = '500';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/messages', params);


            console.log('API Response: ', result);
            console.log('Messages count: ', result.data?.length);

            const data = result.data.map(msg => ({
                timestamp: msg.timestamp,
                room: msg.room_name,
                username: msg.display_name,
                message: msg.msg_content
            }));

            console.log('Formatted Messages:', data);

            return {
                data: data,
                format: 'message-list'
            };

        } catch(error){
            throw new Error(`Failed to get messages: ${error.message}`);
        }
    };
};