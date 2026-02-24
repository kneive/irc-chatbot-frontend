import { createConnectHandler} from './handleConnect';
import { createDisconnectHandler } from './handleDisconnect';
import { createGetAnnouncementHandler } from './handleGetAnnouncements';
import { createGetBitsHandler } from './handleGetBits';
import { createGetGiftHandler } from './handleGetGifts';
import { createGetMessagesHandler } from './handleGetMessages';
import { createGetOnetapgiftHandler} from './handleGetOnetapgifts';
import { createGetPaidupgradeHandler } from './handleGetPaidupgrades';
import { createGetRoomsHandler } from './handleGetRooms';
import { createGetSubsHandler } from './handleGetSubs';
import { createGetUserHandler } from './handleGetUser';
import { createGetUsersHandler } from './handleGetUsers';
import { createGetPayforwardHandler } from './handlePayforwards';
import { createHelpHandler } from './handleHelp';

export const createHandlers = (apiClient, setBackendURL, setEntries, setPaginationState) => {
    return {
        handleConnect: createConnectHandler(setBackendURL),
        handleDisconnect: createDisconnectHandler(setBackendURL, setEntries, setPaginationState),
        handleGetAnnouncements: createGetAnnouncementHandler(apiClient),
        handleGetBits: createGetBitsHandler(apiClient),
        handleGetGifts: createGetGiftHandler(apiClient),
        handleGetMessages: createGetMessagesHandler(apiClient),
        handleGetOnetapgifts: createGetOnetapgiftHandler(apiClient),
        handleGetPaidupgrades: createGetPaidupgradeHandler(apiClient),
        handleGetRooms: createGetRoomsHandler(apiClient),
        handleGetSubs: createGetSubsHandler(apiClient),
        handleGetUser: createGetUserHandler(apiClient),
        handleGetUsers: createGetUsersHandler(apiClient),
        handleGetPayforwards: createGetPayforwardHandler(apiClient),
        handleHelp: createHelpHandler()
    };
};