#!/bin/bash
openssl enc -aes-256-cbc -salt -md sha256 -k $1 -d -in $2 -out $3