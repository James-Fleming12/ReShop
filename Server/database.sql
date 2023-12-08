CREATE DATABASE IF NOT EXISTS reshop;

CREATE TABLE IF NOT EXISTS user(
    id SERIAL PRIMARY KEY,
    usercode VARCHAR(6) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50),
    region VARCHAR(20),
);

CREATE TABLE IF NOT EXISTS post(
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(50),
    item_bio VARCHAR(255),
    item_value BIGINT,
    created TIME DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE IF NOT EXISTS tags(
    id SERIAL PRIMARY KEY,
    tag_title VARCHAR(20) UNIQUE NOT NULL,
);

CREATE TABLE IF NOT EXISTS PostTag(
    user_id INT references user(id),
    tag_id INT references tag(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS message(
    id SERIAL PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
);