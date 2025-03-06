# OTEL in Deno vs. Node

This simple chat app, built with Express and ChatGPT-3.5 API, demonstrates
setting up observability tooling in Deno and in Node.

## Node

Use the branch `node`.

Run the app:

```bash
npm run start
```

Run OTEL stack:

```bash
docker compose up
```

Go to `localhost:3001` to view Grafana.

## Deno

Use the branch `deno`.

Run the app:

```bash
OTEL_DENO=true OTEL_SERVICE_NAME=chat-app deno run --unstable-otel --allow-net --allow-read --allow-env server.js
```

Run OTEL stack:

```bash
docker run --name lgtm -p 3001:3000 -p 4317:4317 -p 4318:4318 --rm -ti \
    -v "$PWD"/lgtm/grafana:/data/grafana \
    -v "$PWD"/lgtm/prometheus:/data/prometheus \
    -v "$PWD"/lgtm/loki:/data/loki \
    -e GF_PATHS_DATA=/data/grafana \
    docker.io/grafana/otel-lgtm:0.8.1
```

Go to `localhost:3001` to view Grafana.
