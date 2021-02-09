const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { debugPort } = require("process");
const port = 8080;

const app = express();

app.use(express.json());
app.use(express.static("static"));
app.use("/static", express.static("static"));
app.use("/uploads", express.static("uploads"));
let init_db = {
  people_count: 0,
  people: [],
  urls: []
};
let db = { ...init_db };
let all_record = { ...init_db };
const path = "./db.json";
const path2 = "./db2.json";

let initDB = () => {
  try {
    if (fs.existsSync(path)) {
      db = JSON.parse(fs.readFileSync(path));
    }
  } catch (err) {
    console.error(err);
  }
  try {
    if (fs.existsSync(path2)) {
      all_record = JSON.parse(fs.readFileSync(path2));
    }
  } catch (err) {
    console.error(err);
  }
};

app.get("/", (req, res) => {
  initDB();
  let text =
    `
    <html>
    <head>
    <title>Face detection</title>
    <style>
    table {
      font-family: arial, sans-serif;
      border-collapse: collapse;
      width: 100%;
    }

    td, th {
      border: 1px solid #dddddd;
      text-align: left;
      padding: 8px;
    }

    tr:nth-child(even) {
      background-color: #dddddd;
    }
    </style>
    </head>

  <body>
    <h2>Current number of people = ` +
    db.people_count.toString() +
    `</h2>`;
  if (db.people_count <= 5)
    text += "<p>People are less than 5; Status: safe</p>";
  else text += "<p>More than 5 person in the room; Status: unsafe</p>";
  var i;
  for (i = 0; i < db.people_count; i++) {
    if (db.people[i].name === "Unknown Person") {
      continue;
    }
    text += '<img src="./static/';
    text += db.people[i].name + '.jpg" width="300" height="300" >';
    var parity = i % 2;
    if (parity === 1) text += "<br/>";
  }
  text += `
  </body>
    </html>`;
  text += `
    <table>
    <tr>
      <th>Name</th>
      <th>Enter/Exit</th>
      <th>Date and time</th>
    </tr>`;
  text += "<h2> Arival and exit records</h2>";
  var the_list = all_record;
  for (i = 0; i < the_list.people.length; i++) {
    text += "<tr>";
    text += "<td>" + the_list.people[i].name + "</td>";
    text += "<td>" + the_list.people[i].type + "</td>";
    var date = new Date(the_list.people[i].time * 1000);
    var x = date.toString();
    x = x.substring(0, 24);
    text += "<td>" + x + "</td>";
    text += "</tr>";
  }
  text += `</table>`;
  res.send(text);
});

app.get("/reset_db", (req, res) => {
  db = { ...init_db };
  fs.writeFileSync(path, JSON.stringify(db));
  res.send(db);
});

app.get("/full_restart", (req, res) => {
  db = { ...init_db };
  all_record = { ...init_db };
  fs.writeFileSync(path, JSON.stringify(db));
  fs.writeFileSync(path2, JSON.stringify(all_record));
  res.send(db);
});

app.post("/log", (req, res) => {
  initDB();
  all_record.people.push(req.body);
  console.log(req.body.type);
  console.log(req.body.name);
  if (req.body.type === "enter") {
    db.people_count++;
    db.people.push(req.body);
  } else {
    var i;
    var index = -1;
    for (i = 0; i < db.people_count; i++) {
      if (db.people[i].name === req.body.name) index = i;
    }
    // console.log("index is");
    // console.log(index);
    if (index > -1) {
      db.people.splice(index, 1);
      db.people_count--;
    }
  }
  fs.writeFileSync(path, JSON.stringify(db));
  fs.writeFileSync(path2, JSON.stringify(all_record));
  res.status(200).send();
});

app.listen(port, () =>
  console.log(` Example app listening at http://localhost:${port}`)
);

app.get("/get_current_people", (req, res) => {
  res.send(db);
});

app.get("/get_all_records", (req, res) => {
  res.send(all_record);
});
var multer = require("multer");
var path_multer = require("path");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    let x = Date.now();
    let where = "https://1lmgs.sse.codesandbox.io/uploads/" + x + ".jpg";
    db.urls.push(where);
    cb(null, Date.now() + path_multer.extname(file.originalname));
    fs.writeFileSync(path, JSON.stringify(db));
  }
});

var upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), function (req, res) {
  db.people_count++;
  res.send("yo");
});
