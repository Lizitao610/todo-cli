const homedir = require('os').homedir()
const home = process.env.HOME || homedir
const p = require('path')
const fs = require('fs')
const dbPath = p.join(home, '.todo')
const inquirer = require('inquirer');

const createTask = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'taskName',
                message: '请输入任务名称(多个任务使用"|"隔开)\n'
            }
        ])
        .then(answers => {
            if (!answers.taskName.trim()) {
                console.error('\n任务名不能为空！\n');
            } else {
                let taskList = answers.taskName.split('|')
                add(taskList).then(() => { console.log('\n添加成功！\n') }, (error) => { console.log(error) })
            }
        });
}

const renameTask = (list, index) => {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'taskName',
                message: '请输入新任务名称\n'
            }
        ])
        .then(async answers => {
            if (!answers.taskName.trim()) {
                console.error('\n任务名不能为空！\n');
            } else {
                list[index].title = answers.taskName
                await write(dbPath, list).then(() => { console.log('\n修改成功！\n') }, (error) => { console.log(error) })
            }
        });
}

const changeTaskStatus = (list, index) => {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'actionType',
                message: '请选择操作',
                choices: [{
                    name: '退出',
                    value: -1
                }, {
                    name: '已完成',
                    value: 1
                }, {
                    name: '未完成',
                    value: 2
                }, {
                    name: '改任务名称',
                    value: 3
                }, {
                    name: '删除',
                    value: 4
                }]
            }
        ])
        .then(async answers => {
            if (answers.actionType !== -1) {
                switch (answers.actionType) {
                    case 1:
                        list[index].done = true
                        await write(dbPath, list).then(() => { console.log('\n修改成功！\n') }, (error) => { console.log(error) })
                        break
                    case 2:
                        list[index].done = false
                        await write(dbPath, list).then(() => { console.log('\n修改成功！\n') }, (error) => { console.log(error) })
                        break
                    case 3:
                        renameTask(list, index)
                        break
                    case 4:
                        list.splice(index, 1)
                        await write(dbPath, list).then(() => { console.log('\n删除成功！\n') }, (error) => { console.log(error) })
                        break
                }
            }
        });
}

const add = async (tasksName) => {
    let list = await read(dbPath).catch((error) => { console.log(error) })
    for (let index = 0; index < tasksName.length; index++) {
        list.push({
            title: tasksName[index],
            done: false
        })
    }
    await write(dbPath, list).catch((error) => { console.log(error) })
}

const showAll = async () => {
    let list = await read(dbPath).catch((error) => { console.log(error) })
    let formatList = list.map((item, index) => {
        return {
            name: `${index + 1}. ${item.title} [${item.done ? '已完成' : '未完成'}]`,
            value: index
        }
    })
    let choices = [{
        name: '退出',
        value: -1
    }, ...formatList, {
        name: '+创建新任务',
        value: -2
    }]
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'taskIndex',
                message: formatList.length?'请选择一个任务':'当前任务列表为空',
                choices: choices
            }
        ])
        .then(answers => {
            if (answers.taskIndex === -2) {
                createTask()
            } else if (answers.taskIndex !== -1) {
                changeTaskStatus(list, answers.taskIndex)
            }
        });
}

const clear = async () => {
    await write(dbPath, []).catch((error) => { console.log(error) })
}

const read = (dbPath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(dbPath, { flag: 'a+' }, (error, data) => {
            if (error) {
                reject(error)
            } else {
                let list
                try {
                    list = JSON.parse(data.toString())
                } catch (error) {
                    list = []
                }
                resolve(list)
            }
        })
    })

}

const write = (dbPath, data) => {
    return new Promise((resolve, reject) => {
        const string = JSON.stringify(data)
        fs.writeFile(dbPath, string, (error) => {
            if (error) {
                reject(error)
            } else {
                resolve()
            }
        })
    })

}

module.exports.createTask = createTask

module.exports.clear = clear

module.exports.showAll = showAll