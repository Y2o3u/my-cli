#!/usr/bin/env node
const program = require('commander')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const download = require('../lib/download')
const prompt = require('inquirer').prompt
const generator = require('../lib/generator')
const latestVersion = require('latest-version')
const chalk = require('chalk')

program
    .parse(process.argv)

let projectName = program.args[0]
if (!projectName) {
    console.log(chalk.red('缺少必要参数'))
    return
}


const list = glob.sync('*')
let next = undefined
let rootName = path.basename(process.cwd())
if (list.length) {
    let filter = list.filter(name => {
        const fileName = path.resolve(process.cwd(), path.join(name))
        const isDir = fs.statSync(fileName).isDirectory()
        return fileName.indexOf(projectName) != -1 && isDir
    })
    if (filter.length > 0) {
        console.log(`项目${projectName}已存在`)
        return
    }
    next = Promise.resolve(projectName)
} else if (rootName === projectName) {
    rootName = '.'
    next = prompt([
        {
            name: 'buildInCurrent',
            message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新目录？',
            type: 'confirm',
            default: true
        }
    ]).then(answer => {
        return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
    })
} else {
    next = Promise.resolve(projectName)
}


next && go()

function go() {
    next.then(projectRoot => {
        if (projectRoot !== '.') {
            fs.mkdirSync(projectRoot)
        }

        let fullProjectRoot = path.resolve(process.cwd(), projectRoot)
        return download(fullProjectRoot)
            .then(target => {
                return {
                    name: projectRoot,
                    root: fullProjectRoot,
                    downloadTemp: target
                }


            })
    }).then(context => {
        // 插入询问面板
        return prompt([
            {
                name: 'projectName',
                message: '项目名称',
                default: context.name
            }, {
                name: 'projectVersion',
                message: '项目版本号',
                default: '1.0.0'
            }, {
                name: 'projectDescription',
                message: '项目简介',
                default: `A project named${context.name}`
            }
        ]).then(answer => {
            return latestVersion('glob').then(version => {
                answer.supportUiVersion = version
                return {
                    ...context,
                    metadata: {
                        ...answer
                    }
                }
            }).catch(err => {
                return Promise.reject(err)
            })
        })
    }).then(async context => {
        let filePath = path.resolve(context.downloadTemp)
        generator(context.metadata, filePath, filePath).then(res => {
            console.log(chalk.green('创建成功'))
        }).catch(err => {
            console.log(chalk.red(`创建失败${err}`))
        })

    }).catch(err => {
        console.log(chalk.red(`创建失败${err}`))
    })


}