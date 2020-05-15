import * as Bluebird from 'bluebird';
import * as express from 'express';
import axios from 'axios';
import * as http from 'http';
import { metrics } from '@balena/node-metrics-gatherer';

const META_EXPORTER_PORT: number =
	((process.env.META_EXPORTER_PORT as unknown) as number) || 9999;

metrics.describe(
	'successful_scrapes_count',
	'number of mega-scrapes that have succeeded',
);

metrics.describe(
	'unsuccessful_scrapes_count',
	'number of mega-scrapes that have failed',
);

let urlList = (process.env.SCRAPE_URLS.split(',') as unknown) as string[];
urlList.push(`${META_EXPORTER_PORT}/self-metrics`);

const app = express();
app.use((req, res, next) => {
	res.header('Content-type', 'text/plain');
	next();
});

app.get('/ping', (_req: any, res: { send: (arg0: string) => void }) =>
	res.send('OK'),
);
app.use('/self-metrics', metrics.requestHandler());
app.get('/metrics', async (req: express.Request, res: express.Response) => {
	const output = await Promise.all(
		urlList.map(async (url) => {
			try {
				const data = await Bluebird.resolve(scrapeUrl(url));
				metrics.counter('successful_scrapes_count');
				return data.data;
			} catch (e) {
				metrics.counter('unsuccessful_scrapes_count');
				console.log(`backend ${url} failed with: ${e.code}`);
				return null;
			}
		}),
	);
	return res.status(200).send(output.join('\n'));
});

const scrapeUrl = async (url: string) => {
	console.log(`scraping http://localhost:${url}`);
	return axios.get(`http://localhost:${url}`);
};

http.createServer(app).listen(META_EXPORTER_PORT, () => {
	if (!process.env.SCRAPE_URLS) {
		console.log(
			'Please pass the port/path URL fragments to scrape as comma-separated SCRAPE_URLS env var',
		);
		process.exit(1);
	}
	console.log(`Metrics Backend listening on port ${META_EXPORTER_PORT}`);
});
