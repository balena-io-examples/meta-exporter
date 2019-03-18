#!/bin/bash
(node_exporter &)
(/app/apk_exporter &)
node /app/src/index.js
