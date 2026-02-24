import { isInteger } from "../utils/apiClient";

export const createGetUserHandler = (apiClient) => {

    return async (args, offset = 0) => {

        try {

            const params = {};

            if (args.length === 0) {
                throw new Error('No username or ID provided.')
            }

            if (isInteger(args[0])) {
                params['user-id'] = args[0];
            } else {
                params['user-name'] = args[0];
            }

            params.limit = '1';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/users', params);

            const data = result.data.map(user => ({
                username: user.display_name,
                uid: user.user_id
            }))

            console.log('API Response: ', result);
            
            return {
                data: data,
                format: 'user-list'
            };

        } catch (error) {
            throw new Error(`Error fetching user info: ${error.message}`);
        }
    };
};