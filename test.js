const spawn = require('child_process').spawn
const which = require('npm-which')
const test = require('tape')
const path = require('path')
const fs = require('fs')
const vm = require('vm')

test('ify-loader', function (t) {
  const wpack = which.sync('webpack', { cwd: __dirname })
  const input = path.join(__dirname, 'fixture', 'index.js')
  const output = path.join(__dirname, 'fixture', 'bundle.js')
  const pkg = path.join(__dirname, 'fixture', 'package.json')

  t.plan(1)

  try {
    fs.unlinkSync(output)
  } catch (e) {}

  spawn(wpack, [
    input,
    output,
    '--module-bind', 'js=' + __dirname
  ], {
    stdio: ['pipe', 'pipe', 2]
  }).once('exit', function () {
    const result = fs.readFileSync(output, { encoding: 'utf8' })

    fs.unlinkSync(output)

    vm.runInNewContext(result, {
      console: {
        log: function (src) {
          const expected = fs.readFileSync(pkg, { encoding: 'utf8' })
          t.equal(src, expected, 'processed brfs from package.json')
        }
      }
    })
  })
})
