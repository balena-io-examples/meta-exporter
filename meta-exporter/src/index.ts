import * as Promise from 'bluebird';
import * as express from 'express';
import * as request from 'request-promise';
import * as http from 'http';
import { metrics } from '@balena/node-metrics-gatherer';

metrics.describe(
    'successful_scrapes_count',
    'number of mega-scrapes that have succeeded',
);

metrics.describe(
    'unsuccessful_scrapes_count',
    'number of mega-scrapes that have failed',
);

const app = express();
app.use((req, res, next) => {
	res.header('Content-type', 'text/plain');
	next();
});
app.get('/ping', (_req: any, res: { send: (arg0: string) => void; }) => res.send('OK'));
app.use('/self-metrics', metrics.requestHandler());
app.get(
	'/metrics',
	(req: express.Request, res: express.Response) => {
	if (!process.env.SCRAPE_PORTS) {
		console.log('Please pass the ports to scrape as SCRAPE_PORTS env var');
		process.exit(1)
	} else {
		let promises: Promise<any[]> = Promise.map(
			process.env.SCRAPE_PORTS.split(',') as unknown as number[], function(exporter: number) {
				console.log(`scraping http://localhost:${exporter}/metrics`);
				return request({uri: `http://localhost:${exporter}/metrics`});
				// TODO count child scrape success/failure
		})
		let output = Promise.reduce(
			promises, (total: string, promise: string) => {
				return total + promise;
		}, '').then((output: string) => {
			metrics.counter('successful_scrapes_count');
			return res.status(200).send( output );
		}).catch((error: Error) => {
			metrics.counter('unsuccessful_scrapes_count');
			return res.status(400).send( error );
		})
	};
});

const MEGA_EXPORTER_PORT: number = process.env.MEGA_EXPORTER_PORT as unknown as number || 9999;

http
    .createServer(app)
    .listen(MEGA_EXPORTER_PORT, () =>
        console.log(
			`Metrics Backend listening on port ${MEGA_EXPORTER_PORT}`,
        ),
    );
