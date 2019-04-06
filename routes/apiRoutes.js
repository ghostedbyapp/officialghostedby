var sequelize = require('sequelize' );
var { Op } = require('sequelize');
var moment = require('moment');
var db = require("../models");

module.exports = function (app) {


app.get("/",function(req,res){
  // Collect top 5 companies
});

  // Look up company
  app.post("/api/lookup", function (req, res) {
    db.ghostedCompany.findAll({
      where: {
        company_name: req.body.company_name
      }
    }).then(function (data) {

      // If a company is in the database. Bring back their data
      if (data.length > 0) {

        companyInfo = {
          info: {
            company_id: data[0].id,
            company_name: data[0].company_name,
            company_address: data[0].company_address,
            company_city: data[0].company_city,
            company_state: data[0].company_state,
            company_zipcode: data[0].company_zipcode,
          },
          found: true
        }

        res.json(companyInfo);
      }

      // No company in the database
      else {
        companyInfo = {
          info: {
            company_name: req.body.company_name,
            company_address: req.body.company_address,
            company_city: req.body.company_city,
            company_state: req.body.company_state,
            company_zipcode: req.body.company_zipcode,
          },
          found: false
        }
        res.json(companyInfo);
        // res.json(req.body)
        // res.send({
      }
        // });
    });
  });

  // Create a new example
  app.post("/api/report", function (req, res) {


    // Check for duplate company name
    db.ghostedCompany.findAll({
      where: {
        company_name: req.body.company_name
      }
    }).then(function (data) {

      // If a company is a duplicate. Increment the ghostedCount by 1
      if (data.length > 0) {

        // Add company id with count
        db.ghostedCount.create({
          ghostedCompanyId: data[0].id,
          ghosted_count: 1,
          entry_date: moment().toDate()

        }).then(function (data) {

          res.json(
            {
              companyInfo: "Duplicated company, but added a ghosted count.",
              data: data
            });
        });

        // If the entered company is not a duplicate. Add them to the database and add 1 to their ghosted count
      } else {

        // Add company info
        db.ghostedCompany.create({
          company_name: req.body.company_name,
          company_address: req.body.street_number + " " + req.body.route,
          company_city: req.body.locality,
          company_state: req.body.administrative_area_level_1,
          company_zipcode: req.body.postal_code,
          entry_date: moment().toDate()

        }).then(function (data) {

          // Add company id with count
          db.ghostedCount.create({
            ghostedCompanyId: data.id,
            ghosted_count: 1,
            entry_date: moment().toDate()

          }).then(function (data) {


            res.json(
              {
                companyInfo: "Company has been added.",
                data: data
              });
            // res.json({
            //   data: data
            
          });
        });
      }
    });
  });

  app.get("/api/ghostedCount/:id", function(req, res) {
    db.ghostedCompany.findAll({
      where: {
        id: req.params.id
      },
      include:
        {
          model: db.ghostedCount,
          attributes: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'count']],
          duplicating: false,
        }
    })
    .then(function(data) {
      console.log(data)
      res.json(data);
    })
  })

  // Load lifetime
  app.post("/api/lifetime", function (req, res) {

    db.ghostedCompany.findAll({

      attributes: ['company_name'],
      include: [
        {
          model: db.ghostedCount,
          attributes: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'count']],
          duplicating: false,
        },
      ],
      // raw: true,
      group: ['company_name'],
      order: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'DESC']],
      limit: 10

    }).then(function (data) {
      console.log(data)


      res.json(data);
    });
  });

  // Load last 7 days
  app.post("/api/last7days", function (req, res) {

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
      // raw: true,
      group: ['company_name'],
      order: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'DESC']],
      limit: 10

    }).then(function (data) {

      console.log(data)

      res.json(data);
    });
  });

  // Load last 30 days
  app.post("/api/last30days", function (req, res) {

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
      // raw: true,
      group: ['company_name'],
      order: [[sequelize.fn('sum', sequelize.col('ghosted_count')), 'DESC']],
      limit: 10

    }).then(function (data) {

      console.log(data)

      res.json(data);
    });
  });

};
