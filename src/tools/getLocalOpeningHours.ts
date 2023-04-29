import { convertTZ, getNotamDate } from './timeTools';

export const getLocalOpeningHours = (notam: any) => {
    const startDateUtc = getNotamDate(notam.startDate);

    let rawText = notam.icaoMessage.split('HR OF SER').at(1)?.trim()?.replaceAll('\n', ' ').split('ON REQ').at(0);
    if (rawText.includes(':')) {
        rawText = rawText.split(': ').at(1);
    }

    const openingParts = rawText.split(', ').map((p: string) => (p.includes('. ') ? p.split('. ').at(0) : p));
    return openingParts
        .map((p: string) => {
            const parts = p.split(' ');
            const timeRangesUtc = parts.at(-1)?.split('-');
            const day = p.replace(parts.at(-1) ?? '', '');

            if (timeRangesUtc?.at(0)?.trim() === 'CLSD') {
                return {
                    day,
                    original: p,
                    text: 'Closed',
                };
            }

            if (!timeRangesUtc || timeRangesUtc.length < 2) {
                return {
                    day,
                    original: p,
                    text: 'Unable to parse',
                };
            }

            try {
                const date = new Date(startDateUtc);
                date.setUTCHours(parseInt(timeRangesUtc[0].substring(0, 2)));
                date.setUTCMinutes(parseInt(timeRangesUtc[0].substring(2, 4)));

                const startLocal = convertTZ(date, 'Europe/Oslo');

                date.setUTCHours(parseInt(timeRangesUtc[1].substring(0, 2)));
                date.setUTCMinutes(parseInt(timeRangesUtc[1].substring(2, 4)));

                const endLocal = convertTZ(date, 'Europe/Oslo');

                return {
                    day,
                    original: p,
                    text: `${startLocal.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })} - ${endLocal.toLocaleTimeString('nb-NO', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}`,
                };
            } catch (e) {
                console.warn(e);

                return {
                    day,
                    original: p,
                    text: 'Unable to parse',
                };
            }
        })
        .map((x: any) => `${x.day}: ${x.text}`)
        .join('\n');
};
