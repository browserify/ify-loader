const readJSON = require('read-package-json')
const resolve = require('resolve')
const map = require('map-limit')
const findup = require('findup')
const path = require('path')

module.exports = loader

function loader (source) {
  const filename = this.resourcePath
  const dirname = this.context
  const done = this.async()
  const self = this

  this.cacheable(true)

  findup(dirname, 'package.json', foundPackage)

  function foundPackage (err, pkgDir) {
    if (err) return done(err)
    if (!pkgDir) return done(null, source)

    const pkgFile = path.join(pkgDir, 'package.json')

    readJSON(pkgFile, function (err, json) {
      if (err) return done(err)

      const pkgTransforms = [].concat(
        json.browserify && json.browserify.transform
      ).filter(Boolean)

      map(pkgTransforms, 10, function (transform, next) {
        transform = Array.isArray(transform) ? transform : [transform]

        const name = transform[0]
        const opts = transform[1] || {}

        if (typeof name === 'function') {
          return next(null, name(filename, opts))
        }

        resolve(name, {
          basedir: pkgDir
        }, function (err, name) {
          if (err) return next(err)

          const TransformStream = require(name)

          if (typeof TransformStream !== 'function') {
            return next(new Error(
              'Browserify transform at ' + name + ' did not export a function'
            ))
          }

          next(null, TransformStream(filename, opts))
        })
      }, function (err, transforms) {
        if (err) return done(err)

        transforms.forEach(function (tr) {
          self.addDependency(tr)
        })

        done(null, transforms.join(''))
      })
    })
  }
}
