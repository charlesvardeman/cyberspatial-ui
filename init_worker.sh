#!/bin/bash

function rabbitmq_ready(){
python << END
import sys
import pika
try:
    connection = pika.BlockingConnection(pika.URLParameters('amqp://$BROKER_USER:$BROKER_PASS@$BROKER_HOST:$BROKER_PORT/'))
except:
    sys.exit(-1)
sys.exit(0)
END
}

until rabbitmq_ready; do
 >&2 echo "RabbitMQ is unavailable - sleeping"
 sleep 1
done

>&2 echo "RabbitMQ is up - continuing..."
python /app/manage.py runworker -v2