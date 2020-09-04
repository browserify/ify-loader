const spawn = require('child_process').spawn
const which = require('npm-which')
const test = require('tape')
const path = require('path')
const fs = require('fs')
const vm = require('vm')

test('ify-loader', function (t) {
  const wpack = which.sync('webpack', { cwd: __dirname })
  const input = path.join(__dirname, 'fixtures', 'basic', 'index.js')
  const output = path.join(__dirname, 'fixtures', 'basic', 'bundle.js')
  const pkg = path.join(__dirname, 'fixtures', 'basic', 'package.json')

  t.plan(1)

  try {
    fs.unlinkSync(output)
  } catch (e) {}

  spawn(wpack, [
    input,
    output,
    '--module-bind', 'js=' + path.resolve(__dirname)
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

test('relative transforms', function (t) {
  const wpack = which.sync('webpack', { cwd: __dirname })
  const input = path.join(__dirname, 'fixtures', 'relative', 'index.js')
  const output = path.join(__dirname, 'fixtures', 'relative', 'bundle.js')

  t.plan(2)

  try {
    fs.unlinkSync(output)
  } catch (e) {}

  spawn(wpack, [
    input,
    output,
    '--module-bind', 'js=' + path.resolve(__dirname)
  ], {
    stdio: ['pipe', 'pipe', 2]
  }).once('exit', function (code) {
    t.doesNotThrow(function () {
      fs.statSync(output)
    }, 'bundle.js was created')
    fs.unlinkSync(output)

    t.ok(!code, 'exit code was 0')
  })
})

test('error handling', function (t) {
  const wpack = which.sync('webpack', { cwd: __dirname })
  const input = path.join(__dirname, 'fixtures', 'errors', 'index.js')
  const output = path.join(__dirname, 'fixtures', 'errors', 'bundle.js')

  t.plan(1)

  spawn(wpack, [
    input,
    output,
    '--module-bind', 'js=' + path.resolve(__dirname)
  ], {
    stdio: ['pipe', 'pipe', 2]
  }).once('exit', function (code) {
    try {
      fs.unlinkSync(output)
    } catch (e) {}

    t.equal(code, 2, 'exit code was 2')
  })
})

test('glsl-transform', function (t) {
  const wpack = which.sync('webpack', { cwd: __dirname })
  const output = path.join(__dirname, 'fixtures', 'glsl', 'bundle.js')
  const config = path.join(__dirname, 'fixtures', 'glsl', 'webpack.config.js')
  const fixture = path.join(__dirname, 'fixtures', 'glsl', 'output.txt')

  t.plan(1)

  try {
    fs.unlinkSync(output)
  } catch (e) {}

  spawn(wpack, [
    '--module-bind', 'js=' + path.resolve(__dirname),
    '--config',
    config
  ], {
    cwd: path.join(__dirname, 'fixtures', 'glsl'),
    stdio: ['pipe', 'pipe', 2]
  }).once('exit', function () {
    const result = fs.readFileSync(output, { encoding: 'utf8' })

    fs.unlinkSync(output)

    vm.runInNewContext(result, {
      console: {
        log: function (shader) {
          const expected = fs.readFileSync(fixture, { encoding: 'utf8' })
          t.equal(shader + '\n', expected, 'processed brfs from package.json')
        }
      }
    })
  })
})
