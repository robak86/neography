#!/bin/bash

echo "Waiting Neo4j to launch on 7687..."

while ! nc -z localhost 7687; do
  sleep 0.1 # wait for 1/10 of the second before check again
done

echo "Neo4j launched"