#!/bin/sh
/bin/blackbox_exporter --web.listen-address=":${SCRAPE_PORT}" --config.file="./blackbox.yml"
