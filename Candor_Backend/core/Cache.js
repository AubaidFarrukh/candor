'use strict'

const flatCache = require('flat-cache')
const fs = require('fs').promises

module.exports = class Cache {
  constructor (name, path, cacheTime = 0) {
    this.name = name
    this.path = path
    this.cache = flatCache.load(name, path)
    this.expire = cacheTime === 0 ? false : cacheTime * 1000 * 60
  }
  getKey (key) {
    var now = new Date().getTime()
    var value = this.cache.getKey(key)
    if (value === undefined){
      return undefined
    }else if(value.expire !== false && value.expire < now) {
      // This key is expired, but returning data and then removing key
      let filePath = this.path+"/"+key
      fs.unlink(filePath)
      return value.data
    } else {
      return value.data
    }
  }
  setKey (key, value) {
    var now = new Date().getTime()
    this.cache.setKey(key, {
      expire: this.expire === false ? false : now + this.expire,
      data: value
    })
  }
  removeKey (key) {
    this.cache.removeKey(key)
  }
  async listKeys () {
    var files = await fs.readdir(this.path)
    return files
  }
  save () {
    this.cache.save(true)
  }
  remove () {
    flatCache.clearCacheById(this.name, this.path)
  }
}