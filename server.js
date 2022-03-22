"use strict";
//подключаемые модули
import WebSocket from "ws";
import cors from "cors";
import http from "http";
import express from "express";
import { addUserOnField } from "./logic/addUserOnField";
import { moveUser } from "./logic/moveUser";
import { makeShot } from "./logic/makeShot";
import { moveShot } from "./logic/moveShot";

const app = express(), // объект типа "сервер"
  bodyParser = require("body-parser"); //модуль, который парсит post-запрос
app.use(bodyParser.json());
app.use(cors());
app.options("*", cors());

app.use(bodyParser.urlencoded({ extended: false }));

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

//список пользователей
let users = [];

// максимальный id пользователя
let maxId = -1;

// максимальный id выстрела
let maxShotId = -1;

//список выстрелов
let shots = [];

//игровое поле
let field = new Array(50).fill(new Array(50).fill(" ")).map((it) => it.slice());

app.post("/register", function (req, res) {
  const { name } = req.body;
  if (!name) {
    res.status(401);
    res.send({ message: "Нужно ввести имя пользователя!" });
  } else {
    users.push({ name, id: maxId + 1 });
    res.send({ id: maxId + 1 });
    maxId++;
  }
});

wss.on("connection", (ws) => {
  const sendDataToAllUsers = () => {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ field, users, shots }));
      }
    });
  };

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === "placeMe") {
      [field, users] = addUserOnField(field, users, parsedMessage.userId);
    } else if (parsedMessage.type === "moveMe") {
      // проверим, что пользователь с данным userId существует в массиве users
      if (users.findIndex((it) => it.id === parsedMessage.userId) !== -1) {
        [field, users] = moveUser(
          field,
          users,
          parsedMessage.userId,
          parsedMessage.direction
        );
      } else {
        ws.close();
      }
    } else if (parsedMessage.type === "shot") {
      /*
        Запомним старое кол-во снарядов на поле, чтобы понять
        появился ли после выстрела снаряд, или стреляли в упор в стену или в упор танк, и снаряда нет на поле (двигать нечего)
      */
      const beforeShotsCount = shots.length;
      [field, shots, users, maxShotId] = makeShot(
        field,
        users,
        parsedMessage.userId,
        shots,
        maxShotId
      );

      // если кол-во снарядов увеличилось на один, то запускаем setInteval движения снаряда
      if (shots.length - beforeShotsCount === 1) {
        const shotId = shots[shots.length - 1].id;
        const shotMovingDescriptor = setInterval(() => {
          // проверяем, есть ли в массиве снарядов снаряд с id = shotId, если нет, то
          // снаряд пропал, и нужно остановить setInterval
          if (shots.findIndex((it) => it.id === shotId) === -1) {
            clearInterval(shotMovingDescriptor);
            return;
          }
          [field, users, shots] = moveShot(field, users, shots, shotId);

          sendDataToAllUsers();
        }, 500);
      }
    }
    sendDataToAllUsers();
  });
});

//start our server
server.listen(8999, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});
