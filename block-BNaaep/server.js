/** @format */

let http = require(`http`);
let fs = require(`fs`);
let url = require(`url`);
let path = require(`path`);
let qs = require(`querystring`);

let contactsPath = path.join(__dirname, `/contacts/`);

let server = http.createServer(handleRequest);

function handleRequest(req, res) {
  let store = "";
  let parseUrl = url.parse(req.url, true);
  let path = parseUrl.path;
  let pathname = parseUrl.pathname;
  let query = parseUrl.query;

  req.on(`data`, chunk => {
    store += chunk;
  });

  req.on(`end`, () => {
    if (req.url === `/contacts` && req.method === `GET`) {
      res.setHeader(`content-type`, `text/html`);
      fs.createReadStream(`./about.html`).pipe(res);
    } else if (path.split(`.`).pop() === `css` && req.method === `GET`) {
      res.setHeader(`content-type`, `text/css`);
      fs.createReadStream(`./assets/about.css`).pipe(res);
    } else if (path.split(`.`).pop() === `png` && req.method === `GET`) {
      res.setHeader(`content-type`, `image/png`);
      fs.createReadStream(`./assets/about.png`).pipe(res);
    } else if (req.url === `/form` && req.method === `POST`) {
      let parseData = qs.parse(store);
      let username = parseData.username;
      let strData = JSON.stringify(parseData);
      //   console.log(parseData);

      fs.open(contactsPath + username + `.json`, `wx`, (err, fd) => {
        if (err) return console.log(err);
        fs.writeFile(fd, strData, err => {
          if (err) return console.log(err);
          fs.close(fd, err => {
            if (err) return console.log(err);
            console.log(`${username} created successfully`);
            res.setHeader(`content-type`, `text/html`);
            res.write(`<h2> Contact saved</h2>`);
            res.end();
          });
        });
      });
    } else if (pathname === `/users` && req.method === `GET`) {
      let username = query.username;
      fs.readFile(contactsPath + username + `.json`, (err, content) => {
        let contentData = JSON.parse(content.toString());
        if (err) return console.log(err);
        res.setHeader(`content-type`, `text/html`);
        res.write(`<h2>name: ${contentData.name}</h2>`);
        res.write(`<h2>email: ${contentData.email}</h2>`);
        res.write(`<h2>age: ${contentData[`Age`]}</h2>`);
        res.write(`<h2>username: ${contentData.username}</h2>`);
        res.write(`<h2>bio: ${contentData.bio}</h2>`);
        res.end();
      });
    }
  });
}

server.listen(4000, () => {
  console.log(`server listening on port 4000`);
});
