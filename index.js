var mysql = require("mysql");
var inquirer = require("inquirer");
// var cTable = require("console.table")


var connection = mysql.createConnection({

  host: "localhost",
  // port
  port: 3306,
  // username
  user: "root",
  // passwrod
  password: "pasword",
  database: "employee_tracker"
});

connection.connect((err) => {
    if (err) throw err;
    // note for later: should I use runSearch(); instead of runSearch(); 
    runSearch();
  });

// code
function runSearch() {
  inquirer
    .prompt({
      name: "selection",
      type: "list",
      message: "What would you like to do?",
      choices: 
        [
            "View All Employees",
            "View Department",
            "View Roles", 
            "Add Employee",
            "Add Department",
            "Add Role", 
            "Update Role",
        ]
    })
    .then(function(answer) {
        console.log(answer);
      
      if (answer.selection === "View All Employees") {
        viewAll();
      }
      else if(answer.selection === "View Department") {
        viewDepts();

      } 
      else if(answer.selection === "View Roles") {
        viewRoles();

      }
      else if(answer.selection === "Add Employee") {
        addEmployee();

      }
      else if(answer.selection === "Add Department") {
        addDept();

      }
      else if(answer.selection === "Add Role") {
        addRole();

      }
      else if(answer.selection === "Update Role") {
        updateRole();

      }else{
        connection.end();
      }
    });
}

//View All Employees Function
function viewAll() {
      connection.query(
        "SELECT employees.id, employees.first_name, employees.last_name, employees.role_id, employees.manager_id, role.title, role.salary, role.id, department.id FROM employees LEFT JOIN role ON employees.role_id = role.id LEFT JOIN department ON role.department_id = department.id", 
        function(err, result, fields) {
          if (err) throw err;
          console.table(result);
          // re-prompt the user for another selection
          runSearch();
        }
      );
    };

 function viewRoles() {
 connection.query(
"SELECT role.id, role.title, role.salary, role.department_id, department.id, department.name FROM role LEFT JOIN department on role.department_id = department.id",
 function(err, result, fields) {
     if (err) throw err;
     console.table(result);
     // re-prompt the user for another selection
     runSearch();
   }
 ); };

 function viewDepts() {
  connection.query("SELECT * FROM department", function(err, result, fields) {
      if (err) throw err;
      console.table(result);
      // re-prompt the user for another selection
      runSearch();
    }
  ); };


var roleChoices = [];
var empChoices = [];
var deptChoices = [];

function lookupRoles(){  
    
    connection.query("SELECT * FROM role", function (err, data) {
        if (err) throw err;
        for (i = 0; i < data.length; i++) {
            roleChoices.push(data[i].id + "-" + data[i].title)
        }
     })
    }

function lookupEmployee(){  
     connection.query("SELECT * FROM employees", function (err, data) {
         if (err) throw err;
         for (i = 0; i < data.length; i++) {
             empChoices.push(data[i].id + "-" + data[i].first_name+" "+ data[i].last_name)
         }
     }) 
    }

function lookupDepts(){
  connection.query("SELECT * FROM department", function (err, data) {
    if (err) throw err;
    for (i = 0; i < data.length; i++) {
        deptChoices.push(data[i].id + "-" + data[i].name)
    }
})
}

function addEmployee() {

    lookupRoles()
    lookupEmployee()

    inquirer.prompt([
    {
      name: "firstname",
      type: "input",
      message: "What is the employee's first name?"
    },

    {
        name: "lastname",
        type: "input",
        message: "What is the employee's last name?"
    },

    {
        name: "role",
        type: "list",
        message: "What is the employee's role?",
        choices: roleChoices 
      },

      {
        name: "reportingTo",
        type: "list",
        message: "Who is the employee's manager?",
        choices: empChoices
      }
    
     ]).then(function(answer) {
      var getRoleId =answer.role.split("-")
      var getReportingToId=answer.reportingTo.split("-")
      var query = 
      `INSERT INTO employees (first_name, last_name, role_id, manager_id)
       VALUES ('${answer.firstname}','${answer.lastname}','${getRoleId[0]}','${getReportingToId[0]}')`;
      connection.query(query, function(err, res) {
        console.log(`new employee ${answer.firstname} ${answer.lastname} added!`)
      });
      runSearch();
    });
};

function addRole() {

  lookupRoles()
  lookupEmployee()
  lookupDepts()

  inquirer.prompt([
  {
    name: "role",
    type: "input",
    message: "Enter the role you would like to add:"
  },

  {
      name: "dept",
      type: "list",
      message: "In what department would you like to add this role?",
      choices: deptChoices
  },

  {
    name: "salary",
    type: "number",
    message: "Enter the role's salary:"
  },
  
   ]).then(function(answer) {
     console.log(`${answer.role}`)
    var getDeptId =answer.dept.split("-")
    var query = 
    `INSERT INTO role (title, salary, department_id)
     VALUES ('${answer.role}','${answer.salary}','${getDeptId[0]}')`;
    connection.query(query, function(err, res) {
      console.log(`<br>-----new role ${answer.role} added!------`)
    });
    runSearch();
  });
};

function addDept() {

  lookupRoles()
  lookupEmployee()
  lookupDepts()

  inquirer.prompt([
  {
    name: "dept",
    type: "input",
    message: "Enter the department you would like to add:"
  }
  ]).then(function(answer) {
    var query = 
    `INSERT INTO department (name)
     VALUES ('${answer.dept}')`;
    connection.query(query, function(err, res) {
      console.log(`-------new department added: ${answer.dept}-------`)
    });
    runSearch();
  });
};


function updateRole() {
  connection.query('SELECT * FROM employees', function (err, result) {
    if (err) throw (err);
    inquirer
      .prompt([
        {
          name: "employeeName",
          type: "list",

          message: "Which employee's role is changing?",
          choices: function () {
            employeeArray = [];
            result.forEach(result => {
              employeeArray.push(
                result.last_name
              );
            })
            return employeeArray;
          }
        }
      ])
   
      .then(function (answer) {
        console.log(answer);
        const name = answer.employeeName;
      
        connection.query("SELECT * FROM role", function (err, res) {
          inquirer
            .prompt([
              {
                name: "role",
                type: "list",
                message: "What is their new role?",
                choices: function () {
                  rolesArray = [];
                  res.forEach(res => {
                    rolesArray.push(
                      res.title)
                  })
                  return rolesArray;
                }
              }
            ]).then(function (rolesAnswer) {
              const role = rolesAnswer.role;
              console.log(rolesAnswer.role);
              connection.query('SELECT * FROM role WHERE title = ?', [role], function (err, res) {
                if (err) throw (err);
                let roleId = res[0].id;
                let query = "UPDATE employees SET role_id = ? WHERE last_name = ?";
                let values = [roleId, name]
                console.log(values);
                
                connection.query(query, values,
                  function (err, res, fields) {
                    console.log(`You have updated ${name}'s role to ${role}.`)
                  })
                viewAll();
              })
            })
        })
        //})
      })
  })
}