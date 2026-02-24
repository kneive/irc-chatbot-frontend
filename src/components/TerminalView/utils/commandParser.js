export const parseCommand = (query) => {
    const command = query.trim().toLowerCase();
    const parts = command.split(' ');
    const oneWord = parts[0];
    const twoWords = parts.slice(0, 2).join(' ');

    let cmd, args;

    if(['connect', 'disconnect', 'clear', 'help'].includes(oneWord)){
        cmd = oneWord;
        args = parts.slice(1);
    } else {
        cmd = twoWords;
        args = parts.slice(2);
    }

    return { cmd, args };
};