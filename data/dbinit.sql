-- Create users table + sequence
CREATE SEQUENCE user_uid_seq;
CREATE TABLE users (
  uid int not null default nextval('user_uid_seq'),
  username varchar(20),
  password varchar(20),
  chatroom varchar(50),
  primary key (uid)
);

INSERT INTO users VALUES (default, 'itsang' , 'itsang', null);



-- Create musicrooms table (list of rooms & currently playing song)

CREATE TABLE musicrooms (
  chatroom_name varchar(50),
  host_name varchar(50),
  current_song varchar(200),
  primary key (chatroom_name)
);

CREATE SEQUENCE messages_mid_seq;

CREATE TABLE chat_messages (
  mid int not null default nextval('messages_mid_seq'),
  chatroom_name varchar(50),
  username varchar(50),
  message varchar(140),
  tstamp date,
  primary key (mid)
);