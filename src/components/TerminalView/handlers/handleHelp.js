import { COMMANDS } from '../config/commands';

export const createHelpHandler = () => {
    return (args) => {
        if(args.length > 0) {
            const cmd = args.join(' ');
            const cmdInfo = COMMANDS[cmd];

            if(cmdInfo) {
                return {
                    data: [{
                        command: cmd,
                        ...cmdInfo
                    }],
                    format: 'help-single'
                };
            } else {
                throw new Error(`Unknown command: ${cmd}. Type 'help' to see all commands.`);
            }
        }

        return {
            data: Object.entries(COMMANDS).map(([cmd, info]) => ({
                command: cmd,
                ...info
            })),
            format: 'help-all'
        };
    };
};