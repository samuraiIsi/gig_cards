const connect = require("connect");
const app = connect();
const serveStatic = require('serve-static');
const fs = require('fs');

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

app.use('/symbols', function(req, res, next) {
    fs.readFile('./data/info.json', 'utf8', function(err, data) {
        if (err) throw err;
        const dataNew = Object.assign({},JSON.parse(data), {'symbols': shuffleArray(JSON.parse(data).symbols)})
        res.end(JSON.stringify(dataNew));
    });
})

app
    .use(serveStatic(__dirname + '/public'))
    .listen(3031, function() {
        console.log('Server running on 3031...');
    });