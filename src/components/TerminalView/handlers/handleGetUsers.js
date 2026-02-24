export const createGetUsersHandler = (apiClient) => {

    return async (args, offset = 0) => {

        try{

            const params = {};

            if(args.length >0 && args[0]){
                params['room-name'] = args[0];
            }

            params.limit = '500';
            params.offset = offset.toString();

            const result = await apiClient.fetchAPI('/api/users', params);

            console.log('API Response: ', result);
            console.log('Users count: ', result.data?.length);

            const data = result.data.map(user => ({
                username: user.display_name,
                uid: user.user_id
            }));

            console.log('Formatted Users: ', data);

            return {
                data: data,
                format: 'user-list'
            };

        } catch (error){
            throw new Error(`failed to get users: ${error.message}`);
        }
    };
};