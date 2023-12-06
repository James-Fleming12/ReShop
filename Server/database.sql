CREATE DATABASE IF NOT EXISTS reshop;

CREATE TABLE IF NOT EXISTS user(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(50),
);

CREATE TABLE IF NOT EXISTS post(
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(50),
    item_bio VARCHAR(255),
    item_value BIGINT,
    created TIME,
);

CREATE TABLE IF NOT EXISTS message(
    id SERIAL PRIMARY KEY,
    sentby INTEGER REFERENCES user(id),
    sentto INTEGER REFERENCES user(id),
);