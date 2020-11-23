# Message Viewer

Message Viewer is a program that takes in ".msg" inputs and displays the
contents of the message as it would be displayed in an email viewer (such as Microsoft Outlook).

## Requirements
- HTTP Ports 3000 and 8080 Available for use
- Docker version 19.03.13

    OR

- NPM Package Manager version 7

## Installation
```bash
git clone https://github.com/manasa-kulkarni/ParseMessages.git

```

## Run the Application (Using Docker - Recommended)
```bash
cd ParseMessages
docker-compose up --build
```
**Navigate to http://localhost:3000**
## Run the Application (Using NPM - Not recommended as npm version conflicts can lead to issues)
```bash
cd ParseMessages/api
node server.js
```
In another Terminal:
```bash
cd ParseMessages/ui
npm start
```
**Navigate to http://localhost:3000**
## Other Notes
This program was created to parse .msg files. This program is intended to be used with most of the .msg file subset I was given. 
However, not all .msg files are created according to the same standards, and this may lead to some misrendered emails when opening certain .msg files.
