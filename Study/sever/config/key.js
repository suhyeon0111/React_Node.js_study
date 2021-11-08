if (process.env.NODE_ENV == 'production') {
    //만약 배포를 했다면 prod모드로 가고
    module.exports = require('./prod');
} else {
    //만약 배포 전이라면 dev모드로 간다.
    module.exports = require('./dev');
} 