const mongoose = require('mongoose');
const SerialTracker = require('../models/SerialTracker'); // Create this model if not already created

const generateEmployeeCode = async (department) => {
  const companyCode = 'COM';
  const year = new Date().getFullYear();
  const deptCode = department.substring(0, 2).toUpperCase();

  let serial = 1;

  try {
    // Check if the serial exists for the current year
    const serialRecord = await SerialTracker.findOne({ year });

    if (serialRecord) {
      serial = serialRecord.serial_no + 1;  // Increment the serial number
      serialRecord.serial_no = serial;  // Update the serial number in the record
      await serialRecord.save();
    } else {
      // If no record exists for the year, create a new record
      const newSerialRecord = new SerialTracker({ year, serial_no: serial });
      await newSerialRecord.save();
    }

    // Format the serial number to 7 digits
    const serialStr = serial.toString().padStart(7, '0');

    return `${companyCode}${year}${deptCode}${serialStr}`;
  } catch (error) {
    console.error('❌ Error generating employee code:', error);
    throw error; // Propagate the error for further handling
  }
};

module.exports = generateEmployeeCode;