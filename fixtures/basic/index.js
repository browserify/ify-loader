const fs = require('fs')
const path = require('path')

console.log(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))
