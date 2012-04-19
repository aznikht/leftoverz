-- Create users table + sequence
CREATE SEQUENCE user_uid_seq;
CREATE TABLE users (
  uid int not null default nextval('user_uid_seq'),
  username varchar(20),
  password varchar(20),
  primary key (uid)
);

INSERT INTO users VALUES (default, 'itsang' , 'itsang');