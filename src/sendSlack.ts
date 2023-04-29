import { Env, Recipient } from '.';

export const sendSlack = async (subject: string, content: string, recipient: Recipient, env: Env) => {
    if (!recipient.url) {
        return;
    }

    let send_request = new Request(recipient.url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: subject,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: content,
                    },
                },
            ],
        }),
    });

    let respContent = '';
    const resp = await fetch(send_request);
    const respText = await resp.text();
    respContent = resp.status + ' ' + resp.statusText + '\n\n' + respText;
    console.log(respContent);
};
