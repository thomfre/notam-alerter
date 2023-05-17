import { Env, Recipient, RecipientType } from '.';
import { sendMail } from './sendMail';
import { sendSlack } from './sendSlack';
import { getLocalOpeningHours } from './tools/getLocalOpeningHours';
import { getNotamDate } from './tools/timeTools';

export const sendAlert = async (notam: any, recipient: Recipient, env: Env) => {
    const startDate = getNotamDate(notam.startDate);
    const endDate = getNotamDate(notam.endDate);

    const startDateString = startDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Oslo',
    });
    const endDateString = endDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Oslo',
    });

    let subject = undefined;
    let content = undefined;

    if (notam.traditionalMessageFrom4thWord.includes('AD HR OF SER')) {
        subject = `⌚ New opening hours detected on ${notam.facilityDesignator}`;
        content = `A new opening hour NOTAM has been detected for ${notam.facilityDesignator}.

The new NOTAM is valid from ${startDateString} to ${endDateString}.
The new opening hours will be (UTC):
${notam.traditionalMessageFrom4thWord.replace('AD HR OF SER:', '').trim().split(', ').join('\n')}

In local time:
${getLocalOpeningHours(notam)}

Complete NOTAM:
${notam.icaoMessage}`;
    } else if (notam.traditionalMessageFrom4thWord.includes('RWY') && (notam.traditionalMessageFrom4thWord.includes('CLSD DUE') || notam.traditionalMessageFrom4thWord.includes('CLOSED DUE'))) {
        const rwy = notam.traditionalMessageFrom4thWord.includes('CLSD DUE') ? notam.traditionalMessageFrom4thWord.split('CLSD DUE') : notam.traditionalMessageFrom4thWord.split('CLOSED DUE');

        subject = `⚠️ Runway closure detected on ${notam.facilityDesignator}`;
        content = `A new runway closure was detected on ${notam.facilityDesignator}, make sure to check this before you plan your next trip.

Runway ${rwy[0].replace('RWY', '').trim()} is closed due to ${rwy[1].trim()} from ${startDateString} to ${endDateString}

Complete NOTAM:
${notam.icaoMessage}`;
    }

    if (subject === undefined || content === undefined) {
        return;
    }

    switch (recipient.type) {
        case RecipientType.Mail:
            await sendMail(
                subject,
                `${content}


This alert was brought to you by ${env.SENDER_NAME}`,
                recipient,
                env
            );
            break;
        case RecipientType.Slack:
            await sendSlack(subject, content, recipient, env);
            break;
    }
};
