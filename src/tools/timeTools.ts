export const convertTZ = (date: Date | string, tzString: string) => {
    return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString }));
};

export const getNotamDate = (date: string): Date => {
    const mainParts = date.split(' ');
    const dateParts = mainParts[0].split('/');
    const hh = mainParts[1].substring(0, 2);
    const mm = mainParts[1].substring(2, 4);

    return new Date(
        Date.UTC(
            parseInt(dateParts[2]),
            parseInt(dateParts[0]) - 1, //this is monthIndex not Month!
            parseInt(dateParts[1]),
            parseInt(hh),
            parseInt(mm)
        )
    );
};
