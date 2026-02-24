import { parseCommandArgs } from '../utils/apiClient';

export const createGetGiftHandler = (apiClient) => {
  
    return async(args, offset=0) =>{
        try{

            const params = parseCommandArgs(args);

            params.limit = '500';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/mysterygifts', params);

            console.log('API Response', result);
            console.log('Mysterygift count:', result.data?.length);

            const data = result.data.map(gift => ({
                timestamp: gift.timestamp,
                username: gift.display_name,
                room: gift.room_name,
                type: gift.sub_plan,
                amount: gift.mass_gift_count
        }));

        console.log('Formatted data:', data);

        return {
            data: data,
            format: 'gift-list'
        };

        } catch (error){
            throw new Error(`Failed to get gifts: ${error.message}`);
        }
    };
};