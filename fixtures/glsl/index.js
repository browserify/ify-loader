const fs = require('fs')
const glsl = require('glslify');
const shader = glsl(fs.readFileSync(__dirname + '/shader.glsl', 'utf8'))
