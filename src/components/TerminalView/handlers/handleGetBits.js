import { parseCommandArgs } from '../utils/apiClient';

export const createGetBitsHandler = (apiClient) => {

    return async (args, offset = 0) => {

        try {

            const params = parseCommandArgs(args);

            params.limit ='500';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/bits', params);

            console.log('API Response: ', result);
            console.log('Bits count: ', result.data?.length);

            const data = result.data.map(bits => ({
                timestamp: bits.timestamp,
                username: bits.display_name,
                room: bits.room_name,
                amount: bits.amount
            }));

            console.log('Formatted Bits: ', data);

            return {
                data: data,
                format: 'bits-list'
            };

        } catch (error) {
            throw new Error(`Error fetching bits: ${error.message}`);
        }
    };
};