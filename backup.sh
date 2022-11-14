#!/bin/bash

sqlite3 .data/database.sqlite .dump > database.dump; git commit -am'Latest db backup'; git push
