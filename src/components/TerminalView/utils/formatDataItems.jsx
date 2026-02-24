export const formatDataItems = (data, format) => {
    return data.flatMap((item, i) => {
        let content;
        let unformattedText;
        let textLength = 0;

        // formatted content
        switch(format) {

            case 'announcement-list':
                unformattedText = `${item.timestamp} user: ${item.username} - room: ${item.room} - system-message: ${item.systemMessage}`;
                textLength = unformattedText.length;
                content = (
                    <>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="announce-username">user: </span>
                        {item.username}
                        {' - '}
                        <span className="announce-room">room: </span>
                        {item.room}
                        {' - '}
                        <span className="announce-system-message">system-message: </span>
                        {item.systemMessage}
                    </>
                );
                break;

            case 'bits-list':
                unformattedText = `${item.timestamp} user: ${item.username} - room: ${item.room} - amount: ${item.amount}`;
                textLength = unformattedText.length;
                content = (
                    <>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="bts-username">user: </span>
                        {item.username}
                        {' - '}
                        <span className="bts-room">room: </span>
                        {item.room}
                        {' - '}
                        <span className="bts-amount">amount: </span>
                        {item.amount}
                    </>
                );
                break;

            case 'connection-status':
                unformattedText = item.message + (item.url ? ` (${item.url})` : '');
                textLength = unformattedText.length;
                content = (
                    <>
                        <span className="status-message">{item.message}</span>
                        {item.url && (
                            <>
                                {' '}
                                <span className="url">({item.url})</span>
                            </>
                        )}
                    </>
                );
                break;

            case 'gift-list':
                unformattedText = `${item.timestamp} user: ${item.username} - room: ${item.room} - type: ${item.type} - amount: ${item.amount}`;
                textLength = unformattedText.length;
                content = (
                    <>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="gift-username">user: </span>
                        {item.username}
                        {' '}
                        <span className="gift-room">room: </span>
                        {item.room}
                        {' : '}
                        <span className="gift-type">type: </span>
                        {item.type}
                        {' '}
                        <span className="gift-amount">amount:</span>
                        {item.amount}
                    </>
                );
                break;

            case 'message-list':
                unformattedText = `${item.timestamp} user: ${item.username} - room: ${item.room} - message: ${item.message}`;
                textLength = unformattedText.length;
                content = (
                    <>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="msg-username">user: </span>
                        {item.username}
                        {' - '}
                        <span className="msg-room">room: </span>
                        {item.room}
                        {' - '}
                        <span className="msg-message">message: </span>
                        {item.message}
                    </>
                );
                break;

            case 'onetapgift-list':
                unformattedText = `${item.timestamp} ${item.username} ${item.room} : ${item.systemMessage}`;
                textLength = unformattedText.length;
                content = (
                    <>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="onetap-username">user: </span>
                        {item.username}
                        {' - '}
                        <span className="onetap-room">room: </span>
                        {item.room}
                        {' - '}
                        <span className="onetap-system-message">system-message: </span>
                        {item.systemMessage}
                    </>
                );
                break;

            case 'paidupgrade-list':
                unformattedText = `${item.timestamp} sender: ${item.sender} recipient: ${item.recipient} room: ${item.room} : ${item.type}`;
                textLength = unformattedText.length;
                content = (
                    <>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="pu-sender">sender: </span>
                        {item.sender ? item.sender : 'none'}
                        {' - '}
                        <span className="pu-recipient">recipient: </span>
                        {item.recipient}
                        {' - '}
                        <span className="pu-room">room: </span>
                        {item.room}
                        {' - '}
                        <span className="pu-type">type: </span>
                        {item.type}
                    </>
                );
                break;
            
            case 'payforward-list':
                unformattedText = `${item.timestamp} gifter: ${item.gifter} - prior gifter: ${item.prior} recipient: ${item.recipient} - room: ${item.room} - system-message: ${item.systemMessage}`;
                textLength = unformattedText.length;
                content = (
                    <>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="pf-gifter">gifter: </span>
                        {item.gifter}
                        {' - '}
                        <span className="pf-prior">prior gifter: </span>
                        {item.prior ? item.prior : 'none'}
                        {' - '}
                        <span className="pf-recipient">recipient: </span>
                        {item.recipient ? item.recipient : item.gifter}
                        {' - '}
                        <span className="pf-room">room: </span>
                        {item.room}
                        {' - '}
                        <span className="pf-system-message">system-message: </span>
                        {item.systemMessage}
                    </>
                );
                break;

            case 'room-list':
                unformattedText = `${item.room}:${item.rid}`;
                textLength = unformattedText.length;
                content = (
                    <>
                        <span className="room-name">{item.room}</span>
                        {' : '}
                        <span className="room-id">{item.rid}</span>
                    </>
                );
                break;


            case 'sub-list':
                unformattedText = `${item.timestamp} user: ${item.username} - room: ${item.room} - type: ${item.type}`;
                textLength = unformattedText.length;
                content = (
                    <>
                        <span className="timestamp">{item.timestamp}</span>
                        {' '}
                        <span className="sub-username">user: </span>
                        {item.username}
                        {' - '}
                        <span className="sub-room">room: </span>
                        {item.room}
                        {' - '}
                        <span className="sub-type">type: </span>
                        {item.type}
                    </>
                );
                break;

            case 'user-list':
                unformattedText = `user: ${item.username} - user-id: ${item.uid}`;
                textLength = unformattedText.length; 
                content = (
                    <>
                        <span className="user-username">user: </span>
                        {item.username}
                        {' - '}
                        <span className="user-user-id">user-id: </span>
                        {item.uid}
                    </>
                );
                break;

            case 'help-all':
                const commandRow = ` ${item.command}`;
                const syntaxRow = `   Syntax: ${item.syntax}`;
                const descRow = `   Description: ${item.description}`;
                
                // Return array of 3 entries
                return [
                    {
                        type: 'result',
                        content: <span className="help-command"> {item.command}</span>,
                        textLength: commandRow.length,
                        timestamp: new Date().toISOString()
                    },
                    {
                        type: 'result',
                        content: (
                            <>
                                <span className="label">   Syntax: </span>
                                <span className="help-syntax">{item.syntax}</span>
                            </>
                        ),
                        textLength: syntaxRow.length,
                        timestamp: new Date().toISOString()
                    },
                    {
                        type: 'result',
                        content: (
                            <>
                                <span className="label">   Description: </span>
                                <span className="help-description">{item.description}</span>
                            </>
                        ),
                        textLength: descRow.length,
                        timestamp: new Date().toISOString()
                    }
                ];
                break;

            default:
                content = <pre>{JSON.stringify(item, null, 2)}</pre>;
        }
        
        return {
            type: 'result',
            content: content,
            unformattedText: unformattedText,
            textLength: textLength,
            timestamp: new Date().toISOString()
        };
    });
};