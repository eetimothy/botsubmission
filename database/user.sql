drop database if exists botworker;

create database botworker;

user botworker

create table user (
	username varchar(64) not null,
	password varchar(64) not null,
	email varchar(128) not null,
	primary key(email)
);

insert into user(email, password, username, mobile) values
	('fred', sha1('fred'), 'fred@gmail.com', '99999999'),
	('wilma', sha1('wilma'), 'wilma@hotmail.com', '88888888'),
	('barney', sha1('barney'), 'barney@gmail.com', '77777777'),
	('betty', sha1('betty'), 'betty@gmail.com', '66666666');