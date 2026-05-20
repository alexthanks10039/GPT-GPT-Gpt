export const employees = [
  {
    id: 'emp_ilya',
    name: 'Илья',
    role: 'Монтажник',
    status: 'Свободен',
    phone: '+7 700 111 22 33',
  },
  {
    id: 'emp_daniyar',
    name: 'Данияр',
    role: 'Прораб',
    status: '2 объекта',
    phone: '+7 701 222 33 44',
  },
  {
    id: 'emp_artem',
    name: 'Артём',
    role: 'Монтажник',
    status: 'Занят',
    phone: '+7 702 333 44 55',
  },
];

export const getEmployeeById = (employeeId) => employees.find((employee) => employee.id === employeeId) || null;
