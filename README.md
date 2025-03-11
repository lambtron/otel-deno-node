# OTEL in Deno vs. Node

This project shows how to setup observability for the same app in Node and Deno.

## Node

In `./node-express-otel`,

Run the app:

```bash
npm run start
```

Run OTEL LGTM stack:

```bash
docker run --name lgtm -p 3000:3000 -p 4317:4317 -p 4318:4318 --rm -ti \
    -v "$PWD"/lgtm/grafana:/data/grafana \
    -v "$PWD"/lgtm/prometheus:/data/prometheus \
    -v "$PWD"/lgtm/loki:/data/loki \
    -e GF_PATHS_DATA=/data/grafana \
    docker.io/grafana/otel-lgtm:0.8.1
```

Go to `localhost:3000` to view Grafana.

## Deno

In `./deno-express`:

Run the app:

```bash
# Run app without sending OTEL data
deno task start

# Run app sending OTEL data
deno task otel
```

Run OTEL LGTM stack:

```bash
docker run --name lgtm -p 3000:3000 -p 4317:4317 -p 4318:4318 --rm -ti \
    -v "$PWD"/lgtm/grafana:/data/grafana \
    -v "$PWD"/lgtm/prometheus:/data/prometheus \
    -v "$PWD"/lgtm/loki:/data/loki \
    -e GF_PATHS_DATA=/data/grafana \
    docker.io/grafana/otel-lgtm:0.8.1
```

Go to `localhost:3000` to view Grafana.
