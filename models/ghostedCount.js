module.exports = function (sequelize, DataTypes) {

    // Added TIMESTAMP to collect dates
    // entry_date is the new data field
    const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

    var ghostedCount = sequelize.define("ghostedCount", {
        ghosted_count: DataTypes.INTEGER,
        entry_date: TIMESTAMP
    },
        {
            // Remove createAt and updateAt from the database
            createdAt: false,
            updatedAt: false
        });
    return ghostedCount;
};
