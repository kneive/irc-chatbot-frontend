import { parseCommandArgs } from '../utils/apiClient';

export const createGetPaidupgradeHandler = (apiClient) => {

    return async (args, offset = 0) => {

        try {
            const params = parseCommandArgs(args);

            params.limit = '500';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/paidupgrades', params);

            console.log('API Response: ', result);
            console.log('Paidupgrade count: ', result.data?.length);

            const data = result.data.map(paidupgrade => ({
                timestamp: paidupgrade.timestamp,
                sender: paidupgrade.display_name,
                recipient: paidupgrade.recipient_display_name,
                room: paidupgrade.room_name,
                type: paidupgrade.sub_plan
            }));

            console.log('Formatted Paidupgrade messages: ', data);

            return {
                data: data,
                format: 'paidupgrade-list'
            };
        } catch(error) {
            throw new Error(`Error fetching paidupgrades: ${error.message}`);
        }
    };
};