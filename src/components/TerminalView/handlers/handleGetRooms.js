export const createGetRoomsHandler = (apiClient) => {

    return async (args, offset) => {

        try {
            const params = {};

            params.limit = '500';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/rooms', params);

            console.log('API Response: ', result);
            console.log('Room count: ', result.data?.length);

            const data = result.data.map(room => ({
                room: room.room_name,
                rid: room.room_id
            }));

            console.log('Formatted Rooms: ', data);
            
            return {
                data: data,
                format: 'room-list'
            };
        } catch (error) {
            throw new Error(`failed to get rooms: ${error.message}`);
        }
    };
};