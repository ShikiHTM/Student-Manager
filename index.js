import mysql from 'mysql2'
import inquirer from 'inquirer'
import AsciiTable from 'ascii-table'
import { createSpinner } from 'nanospinner'
import { create } from 'domain'

const connectToDatabase = mysql.createConnection({ 
    host: 'localhost',
    user: 'root',
    password: 'Botan123',
    database: 'test',
})
const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function backToMenu() {
    menu()
}

async function AddNewStudent() {
    const doList = [{
        name: 'id',
        type: 'input',
        message: 'ID: ',
        validate: (ans) => {
            if(isNaN(ans)) {
                return 'Please enter a valid ID';
            }
            return true;
        }
    },
    {
        name: 'name',
        type: 'input',
        message: 'Name: ',
        validate: (ans) => {
            if(ans == '') {
                return 'Please enter a valid Name';
            }
            return true;
        }
    },
    {
        name: 'class',
        type: 'input',
        message: 'Class: ',
        validate: (ans) => {
            if(ans == '') {
                return 'Please enter a valid Class';
            }
            return true;
        }
    },
    {
        name: 'city',
        type: 'input',
        message: 'City: ',
    },
    {
        name: 'age',
        type: 'input',
        message: 'Age: ',
        validate: (ans) => {
            if(isNaN(ans)) {
                return 'Please enter a valid Age'
            }
            return true;
        }
    },
    {
        name: 'level',
        type: 'input',
        message: 'Level: ',
    },
]

    await inquirer.prompt(doList).then((ans) => {
        let id = ans.id;
        let name = ans.name;
        let classroom = ans.class;
        let age = ans.age;
        let city = ans.city;
        let hocvan = ans.level;

        connectToDatabase.query(`INSERT INTO student VALUES(${id}, "${name}", "${classroom}", ${age}, "${city}", "${hocvan}")`, async (err, res) => {
                console.log("Success ✅");
                await sleep();

                backToMenu();
            })
    })
}

async function AddNewStudentActionChoice() {
    await inquirer.prompt({
        name: 'action',
        type: 'input',
        message: 'What is your action?\n1. Add new Student\n2. Back to Menu\n',
    }).then((choice) => {
        if(choice.action == 1) AddNewStudent()
        if(choice.action == 2) backToMenu()
    })
}

async function ShowTable() {
    await inquirer.prompt({
        name: 'table',
        type: 'input',
        message: 'Name Of the table you want to display: '
    }).then(answer => {
        let table = new AsciiTable()
        table.setHeading('ID', 'Full_Name', 'Class', 'Age', 'City', 'Hoc_Luc')
        connectToDatabase.query(`SELECT * FROM ${answer.table}`, async(err, res) => {
            for(let i = 0; i < res.length; ++i) {
                let info = res[i]
                table.addRow(info.id, info.Ho_Ten, info.Lop, info.Age, info.Thanh_PHO, info.Hoc_Luc)
            }
            console.log(table.toString())
        })
    })

    await sleep()
    await inquirer.prompt({
        name: 'choice',
        type: 'confirm',
        message: 'Wanna back to Menu yet?'
    }).then(ans => {
        if(ans.choice) backToMenu();
        else backToMenu();
    })
}

async function DeleteStudent(tableID) {
    await inquirer.prompt({
        name: 'ID',
        type: 'input',
        message: 'What is the ID of the student you want to delete?\nYour answer is:',
        validate: (ans) => {
            if(isNaN(ans)) return 'Please enter a valid ID'
            return true
        }
    }).then((ans) => {
        const id = ans.ID;
        connectToDatabase.query(`DELETE FROM ${tableID} WHERE id=${id}`, async (err, res) => {
            console.log("Success ✅")
            await sleep()
            backToMenu()
        })
    })
}

async function SelectTableToDeleteStudent() {
    await inquirer.prompt({
        name:'tableID',
        type: 'input',
        message: 'Which table do you want to delete a student?\nYour answer is:',
        validate: (ans) => {
            if(ans == '') return 'Please enter a valid Name'
            return true;
        }
    }).then((ans) => {
        const table = ans.tableID;
        DeleteStudent(table)
    })
}

async function CollectStudentIdToChangeInformations() {
    await inquirer.prompt({
        name:'Table',
        type:'input',
        message: "Which Table do you want to access?\nYour answer is:",
    }).then(async(TABLE) => {
    let table = TABLE.Table;
    await inquirer.prompt({
        name: 'Id',
        type: 'input',
        message: "What is the ID of the student you want to change Informations?\nYour answer is:",
        validate: (ans) => {
            if(isNaN(ans)) return 'Please enter a valid ID'
            return true;
        }
    }).then(async (ID) => {
        let id = ID.Id
        await inquirer.prompt({
            name: 'Path',
            type: 'list',
            message: "Which path of this student you want to change?",
            choices: [
                'ID',
                'Full Name',
                'Class',
                'Age',
                'City',
                'Level',
            ],
        }).then(async(PATH)=> {
            let path = PATH.Path;
            await inquirer.prompt({
                name: 'update',
                type: 'input',
                message: "Update value is:",
            }).then(async(VALUE)=> {
                switch(path) {
                    case 'ID':
                        path = 'id';
                        break;
                    case 'Full Name':
                        path = 'Ho_Ten';
                        break;
                    case 'Class':
                        path = 'Lop';
                        break;
                    case 'City':
                        path = 'Thanh_PHO';
                        break;
                    case 'Level':
                        path = 'Hoc_Luc';
                        break;
                }
                let valueUpdate = VALUE.update

                console.log(id, path, valueUpdate)
                connectToDatabase.query(`UPDATE ${table} SET ${path}="${valueUpdate}" WHERE id=${id}`, async(err, res)=> {
                    console.log("Success ✅")
                    await sleep()
                    backToMenu()
                })
            })
        })
    })
    })}

async function menuOption() {
    await inquirer.prompt({
        name: 'action',
        type: 'input',
        message: [
            'Please choose an action\n1. Create a new Table\n2. Change Student Informations\n3. Delete Student from Database\n4. Add new Student to Database\n5. Seach a Student from Database\n6. Display Table\nYour choice is:',
        ],
        validate: (choice) => {
            if(isNaN(choice)) {
                return 'Please enter a valid number!'
            }
            return true;
        }
    }).then((ans) => {
        const choice = ans.action;
        if(choice == 2) {
            CollectStudentIdToChangeInformations()
        }
        if(choice == 3) {
            SelectTableToDeleteStudent()
        }
        if(choice == 4) {
            AddNewStudentActionChoice()
        }
        if(choice == 6) {
            ShowTable();
        }
    })
}

async function menu() {
    console.clear();
    console.log("                               WELCOME ABOARD TEACHER!")
    menuOption();

}

async function begin(menu) {
    const spinner = createSpinner('We are trying to connect to the databases...').start();
    await sleep();

    if(connectToDatabase.connect((err) => {
        if(err) {
            spinner.error({text: "Failed to connect to the database..."});
        } else {
            spinner.success({text: "Connected to the database!"});
        }
}));
    await sleep();
    console.clear();

    menu();
}

begin(menu)