# Chat application

## Goal

The goals of this project were to:

1. Create a simple chat application that allows users to share messages
2. Manage sessions :
   - Allow to Register with a nickname
   - Allow to Login/Logout
   - Allow to Share messages in real-time
3. Use database for the last step

## Technologies

- NPM

  To manage all the packages.

- NodeJS

  To have a Real-time server infrastructure as the project requires.
  We used the crypto module from NodeJS to hash passwords with the SHAE256 algorithm.
  Thus even if the database is leaked, the passwords remain safe.

- Express.JS

  To accelerate the server development.

- Socket.IO

  Allows us to create a socket to update messages in real-time instead of simulating it with the long-polling techniques.

- MySql

  We could have used MongoDB but we wanted to use MySQL in order to learn it.

## Team:

- [**Brice Bartoletti**](https://github.com/Levizar)
- [**Louis Wicket**](https://github.com/512LouisWicket)
- [**Maelys Etienne**](https://github.com/Mae26)

Thanks to our [Woods team-mates](https://github.com/orgs/becodeorg/teams/crl-woods-2-15) from BeCode for their support.

Special Thank's to Louis Wicket's friends. They always had an anwsers to our endless questionning.

## Comments:

### Brice:

We encountered several difficulties with this project.

- First, we felt very concerned about the password and data security and thus we immediately made a lot of researches about Password hashing and database security. We spent a lot of time on this subject but in the end, we had a good idea of what we had to do.

- Another problem we encountered was the communication between the server and the client. It was easy for the chat part because everything was handled by Socket.IO. It was harder for the form because NodeJS doesn't work like PHP and thus we can't just use formData as I was used to. We ended up solving the problem by posting the subscription form in a JSON format that is easy to manipulate.

- The bigger problem was the deployement part of the site because we made the choice to use MySQL instead of mongoDB, we couldn't deploy it on Heroku (it works with PostGreSQL) or Webhost (it doesn't support nodeJS). I tried to convert MySQL to PostGreSQL to deploy it on Heroku but I didn't manage to do that in time for this project.

## How to test it:

### Requirement:

- MySql
- an SQL administration tool

### Todo:

- Clone the repository
- Open "login.json"
- Replace the configuration by your local MySQL configuration
  - The server itself doesn't need a lot of rights management.
    It only needs the right to query and insert data into the USERS table.
- In your local MYSQL CLI, create the database "chat" and the table users with column as behind or copy/paste these SQL statements and execute it.
  ```SQL
    CREATE DATABASE IF NOT EXISTS chat;
    USE chat;
    CREATE TABLE users
    (
    id VARCHAR(255),
    username VARCHAR(20),
    sha256_password VARCHAR(255),
    email VARCHAR(100)
    );
  ```
- Open your terminal in the root of the repository
- execute this command:
    ```bash
    npm install && npm start
    ```
- Go to your localhost to test the chat