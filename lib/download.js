const download = require('download-git-repo')
const ora = require('ora')
const path = require('path')

// 对下载进行一次封装，封装成同步命令
function dw(target) {
    target = path.join(target || '.', '.')
    return new Promise((resolve, reject) => {
        let url = 'direct:https://github.com/Y2o3u/cli-temp/archive/refs/heads/main.zip'
        const spinner = ora(`正在下载项目模板，源地址https://github.com/Y2o3u/cli-temp`)
        spinner.start()
        download(url, target, (err) => {
            if (err) {
                reject(err)
                spinner.fail()
            } else {
                spinner.succeed()
                resolve(target)
            }
        })
    })
}

module.exports = dw

// test
// dw(path.resolve(__dirname))
