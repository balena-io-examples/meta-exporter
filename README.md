# meta-exporter
## Monitor many endpoints from one public URL

Building off the initial monitoring backend build laid out in [part
1](https://www.balena.io/blog/monitoring-the-edge-with-prometheus-pt-1/), this example extends our monitoring stack to
include multiple on-device exporters, all aggregated in a way that makes scraping via public URL convenient and easy.

This example project deploys a simple frontend exporter aggregator called the `meta-exporter`, which accepts a list of
URLs to scrape on `localhost`. Each URL can be passed as a comma-separated environment variable called `SCRAPE_URLS`.
These URL fragments should be structured like so: `{{port}}/{{path}}`. The `meta-exporter will in turn scrape each
listed exporter and return any data it receives. It will also return it's own scraping metadata as part of the scrape.

This project includes some examples like `node-exporter` for machine metrics, as well as `blackbox-exporter` for
arbitrary service monitoring. Those examples are located in the [examples](./examples) folder and can be modified to
suit your needs. As written, the `blackbox-exporter` is configured to make a simple request against balenaCloud. You can
use the relevant `docker-compose.yml` stanzas and drop them into your own project as you see fit.
