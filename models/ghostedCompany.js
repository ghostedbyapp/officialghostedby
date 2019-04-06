module.exports = function (sequelize, DataTypes) {

  // Added TIMESTAMP to collect dates
   // entry_date is the new data field
  const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

  var ghostedCompany = sequelize.define("ghostedCompany", {
    company_name: DataTypes.STRING,
    company_address: DataTypes.STRING,
    company_city: DataTypes.STRING,
    company_state: DataTypes.STRING,
    company_zipcode: DataTypes.STRING,
    logo: DataTypes.STRING,
    entry_date: TIMESTAMP
  },
    {
      // Remove createAt and updateAt from the database
      createdAt: false,
      updatedAt: false
    });
  return ghostedCompany;
};
