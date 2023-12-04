CREATE DATABASE IF NOT EXISTS reshop;

CREATE TABLE user(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(50),
);

CREATE TABLE post(
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(50),
    item_bio VARCHAR(255),
    item_value BIGINT,
    created TIME,
);