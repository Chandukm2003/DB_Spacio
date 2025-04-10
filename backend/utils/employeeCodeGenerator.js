const pool = require('../config/db');

const generateEmployeeCode = async (department) => {
  const companyCode = 'COM';
  const year = new Date().getFullYear();
  const deptCode = department.substring(0, 2).toUpperCase();

  let serial = 1;

  const result = await pool.query('SELECT serial_no FROM serialtracker WHERE year = $1', [year]);

  if (result.rows.length > 0) {
    serial = result.rows[0].serial_no + 1;
    await pool.query('UPDATE serialtracker SET serial_no = $1 WHERE year = $2', [serial, year]);
  } else {
    await pool.query('INSERT INTO serialtracker (year, serial_no) VALUES ($1, $2)', [year, serial]);
  }

  const serialStr = serial.toString().padStart(7, '0');

  return `${companyCode}${year}${deptCode}${serialStr}`;
};

module.exports = generateEmployeeCode;
