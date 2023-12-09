CREATE DATABASE IF NOT EXISTS reshop;

CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    usercode VARCHAR(6) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE,
    region VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS tags(
    id SERIAL PRIMARY KEY,
    tag_title VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS post(
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(50),
    item_bio VARCHAR(255),
    item_value BIGINT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tags INTEGER[] REFERENCES tags(id)
);

INSERT INTO tags(tag_title)
VALUES 
    ('Type1'),
    ('Type2'),
    ('Type3');

CREATE INDEX post_tag_index ON post(tags);
CREATE INDEX post_date_index ON post(created);

CREATE TABLE IF NOT EXISTS purchases(
    purchased_by INT REFERENCES users(id),
    purchased_from INT REFERENCES users(id),
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message(
    id SERIAL PRIMARY KEY,
    user_from INT REFERENCES users(id) ON DELETE CASCADE
);