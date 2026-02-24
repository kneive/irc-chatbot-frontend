import { parseCommandArgs } from '../utils/apiClient';

export  const createGetPayforwardHandler = (apiClient) =>{

    return async (args, offset = 0) => {

        try {
            const params = parseCommandArgs(args);

            params.limit = '500';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/payforwards', params);

            console.log('API Response: ', result);
            console.log('Payforward count: ', result.data?.length);

            const data = result.data.map(payforward => ({
                timestamp: payforward.timestamp,
                gifter: payforward.display_name,
                prior: payforward.prior_gifter_display_name,
                recipient: payforward.recipient_display_name,
                room: payforward.room_name,
                systemMessage: payforward.system_msg_content
            }));

            console.log('Formatted payforward messages: ', data);

            return {
                data: data,
                format: 'payforward-list'
            };
        } catch (error){
            throw new Error(`Failed to get payforward messages: ${error.message}`);
        }
    };
};