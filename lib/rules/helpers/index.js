function isRelativePath(path) {
    return path === '.' || path.startsWith('./') || path.startsWith('../')
}

module.exports = {
    isRelativePath
}