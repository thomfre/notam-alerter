import { Env, Recipient } from '.';

export const sendMail = async (subject: string, content: string, recipient: Recipient, env: Env) => {
    if (!recipient.email) {
        return;
    }

    let send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            personalizations: [
                {
                    to: [{ email: recipient.email, name: recipient.name }],
                    dkim_domain: env.DKIM_DOMAIN,
                    dkim_selector: env.DKIM_SELECTOR,
                    dkim_private_key: env.DKIM_PRIVATE_KEY,
                },
            ],
            from: {
                email: env.SENDER_EMAIL,
                name: env.SENDER_NAME,
            },
            subject,
            content: [
                {
                    type: 'text/plain',
                    value: content,
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
