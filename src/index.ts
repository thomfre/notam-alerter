/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

import { sendAlert } from './sendAlert';

export interface Env {
    AIRPORT_CODES: string;
    STORAGE: KVNamespace;
    DKIM_DOMAIN: string;
    DKIM_SELECTOR: string;
    DKIM_PRIVATE_KEY: string;
    SENDER_NAME: string;
    SENDER_EMAIL: string;
}

export enum RecipientType {
    Mail = 'Mail',
    Slack = 'Slack',
}

export interface Recipient {
    key: string;
    name: string;
    email?: string;
    url?: string;
    type: RecipientType;
}

export default {
    async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
        const { STORAGE } = env;

        let notams = await fetch('https://notams.aim.faa.gov/notamSearch/search', {
            method: 'POST',
            body: `searchType=0&designatorsForLocation=${env.AIRPORT_CODES}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then<any>((r) => r.json());

        const filteredNotams = notams.notamList.filter(
            (n: any) =>
                n.traditionalMessageFrom4thWord.includes('AD HR OF SER') ||
                n.traditionalMessageFrom4thWord.includes('CLSD DUE') ||
                n.traditionalMessageFrom4thWord.includes('CLSD ') ||
                n.traditionalMessageFrom4thWord.includes('AD CLOSED ') ||
                n.traditionalMessageFrom4thWord.includes('AD CLSD ') ||
                n.traditionalMessageFrom4thWord.includes('AERODROME CLSD ') ||
                n.traditionalMessageFrom4thWord.includes('AERODROME CLOSED ') ||
                n.traditionalMessageFrom4thWord.includes('CLOSED DUE') ||
                n.traditionalMessageFrom4thWord.includes('PPR ')
        );

        if (filteredNotams.length === 0) {
            return;
        }

        const recipients: Recipient[] = (await STORAGE.get('recipients', { type: 'json' })) ?? [];

        for (const recipient of recipients) {
            const alreadyAlerted = (await STORAGE.get<string[]>(recipient.key, { type: 'json' })) ?? [];

            const relevant = filteredNotams.filter((n: any) => !alreadyAlerted.includes(n.notamNumber));

            if (relevant.length === 0) {
                continue;
            }

            for (const notam of relevant) {
                await sendAlert(notam, recipient, env);
            }

            await STORAGE.put(recipient.key, JSON.stringify([...alreadyAlerted, ...relevant.map((n: any) => n.notamNumber)]));
        }
    },
};
