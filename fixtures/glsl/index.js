const fs = require('fs')
const glsl = require('glslify')
glsl(fs.readFileSync(__dirname + '/shader.glsl', 'utf8'))
