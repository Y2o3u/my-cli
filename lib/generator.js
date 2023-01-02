const metalsmith = require('metalsmith')
const handlebars = require('handlebars')
// const rm = require('rimraf').sync

module.exports = function (metadata = {}, src, dest = '.') {
    if (!src) {
        return Promise.reject(new Error('无效的source:', src))
    }

    return new Promise((resolve, reject) => {
        metalsmith(process.cwd())
            .metadata(metadata)
            .clean(false)
            .source(src)
            .destination(dest)
            .use((files, ms, done) => {
                // console.log(files)
                const meta = ms.metadata()
                Object.keys(files).forEach(fileName => {
                    const t = files[fileName].contents.toString()
                    let str = Buffer.from(handlebars.compile(t)(meta))
                    files[fileName].contents = str
                })
                done()
            }).build(err => {
                // rm(src)
                err ? reject(err) : resolve()
            })
    })
}

