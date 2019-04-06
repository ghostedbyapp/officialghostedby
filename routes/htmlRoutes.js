var sequelize = require('sequelize' );
const { Op } = require('sequelize')
var moment = require('moment');
var db = require("../models");

module.exports = function (app) {

  // Load Lifetime
  app.get("/lifetime", function (req, res) {

    db.ghostedCompany.findAll({

      attributes: ['company_name'],
      include: [
        {
          model: db.ghostedCount,
          attributes: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'bleh']],
          duplicating: false,
        },
      ],
      raw: true,
      group: ['company_name'],
      order: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'DESC']],
      limit: 10

    }).then(function (data) {
      console.log(data)

      // Render needs to be used here for handlebars
      res.json(data);
    });
  });



  // Load Between Dates for current week: Sunday - Saturday
  app.get("/currentweek", function (req, res) {
1
  // Used to get data range in current week
  //const from_date = moment().startOf('week').toDate();
  //const to_date = moment().endOf('week').toDate();

    db.ghostedCompany.findAll({

      attributes: ['company_name'],
      include: [
        {
          model: db.ghostedCount,
          // Used to get range in database
          // where: {
          //   entry_date: {
          //     $between: [from_date, to_date]
          //   },

          // Used to get last 7 days
            where: {
              entry_date: {
                [Op.gte]: moment().subtract(7, 'days').toDate()
              },
            },
            attributes: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'count']],
            duplicating: false,
          },
      ],
      raw: true,
      group: ['company_name'],
      order: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'DESC']],
      limit: 10

    }).then(function (data) {
      console.log(data)

      // Render needs to be used here for handlebars
      res.json(data);
    });
  });


  // Load pass 30 days or pass 7 days
  app.get("/last30days", function (req, res) {

    db.ghostedCompany.findAll({

      attributes: ['company_name'],
      include: [
        {
          model: db.ghostedCount,

          where: {
            entry_date: {
              //[Op.gte]: moment().subtract(7, 'days').toDate(),
              [Op.gte]: moment().subtract(1, 'months').toDate(),
            },
          },
          attributes: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'count']],
          duplicating: false,
        },
      ],
      raw: true,
      group: ['company_name'],
      order: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'DESC']],
      limit: 10

    }).then(function (data) {
      console.log(data)

      // Render needs to be used here for handlebars
      res.json(data);
    });
  });



  // Render 404 page for any unmatched routes
  // app.get("*", function (req, res) {
  //   res.render("404");
  // });
};
