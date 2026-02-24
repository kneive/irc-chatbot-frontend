import { parseCommandArgs } from '../utils/apiClient';

export const createGetAnnouncementHandler = (apiClient) => {

    return async(args, offset=0) => {

        try {
            const params = parseCommandArgs(args);

            params.limit = '500';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/announcements', params);

            console.log('API Response: ', result);
            console.log('Announcement count: ', result.data?.length);

            const data = result.data.map(announcement => ({
                timestamp: announcement.timestamp,
                username: announcement.display_name,
                room: announcement.room_name,
                systemMessage: announcement.msg_content
            }));

            console.log('Formatted Announcements: ', data);

            return {
                data: data,
                format: 'announcement-list'
            };

        } catch(error){
            throw new Error(`Failed to get announcements: ${error.message}`);
        }

    };
};