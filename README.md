# news-desk2
A web app to read and annotate news articles

## Docker commands

The env.list file needs to be populated with credentials to access the postgre db and rabbitmq queue.

```
DB_USER=<userid>
DB_PASSWORD=<password>
DB_HOST=<host>
DB_DATABASE=<database>
QUEUE_CONNECTION_STRING=amqp://<user>:<password>@<host>/<user>
```

```bash
docker build --label stage=trial --build-arg stage=dynamic -t newsreader . 

docker run --env-file ..\env.list -p 3000:3000 -it newsreader
```