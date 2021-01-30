'use strict';
const { response } = require('express');
const mongoose = require('mongoose');
const issueSchema = new mongoose.Schema({
  issue_title: {
    type: String, 
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_on: String,
  updated_on: String,
  created_by: {
    type: String,
    required: true
  },
  assigned_to: {
    type: String,
    default: ''
  },
  open: {
    type: Boolean,
    default: true
  },
  status_text: {
    type: String,
    default: ''
  },
  project: {
    type: String,
    required: true
  }
})

let Issue = mongoose.model('Issue', issueSchema);
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res) {
      let queries = req.query;
      let objKeys = Object.keys(queries);
      let project = req.params.project;

      Issue.find(
        objKeys.length > 0 
        ? {project: project, ...queries}
        : {project: project}
        )
        .select('-__v -project')
        .exec((err, data) => {
          if (err) {
            console.log(err)
          }
          res.json(data)
        }
      )
    })
    
    .post(function (req, res){
        const newIssue = new Issue({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_on: new Date().toUTCString(),
          updated_on: new Date().toUTCString(),
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          status_text: req.body.status_text,
          project: req.params.project
        });
        if (!newIssue.issue_title || !newIssue.issue_text || !newIssue.created_by) {
          res.json({
            error: 'required field(s) missing'
          })
        }
        newIssue.save((err, data) => {
          if (err) {-
            console.log(err)
          }
          res.json(data)
        })
    })
    
    .put(function (req, res){
      let updates = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (value != '') {
          updates[key] = value
        }
      };
      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }
      if (Object.keys(updates).length < 2) {
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id });
      };
      updates['updated_on'] = new Date().toUTCString();
      Issue.findByIdAndUpdate(req.body._id, updates, { new: true }, (error, data) => {
        if (data) {
          return res.json({ result: 'successfully updated', '_id': updates._id });
        } else {
          return res.json({ error: 'could not update', '_id': updates._id });
        }
      });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      if (!req.body._id) {
        return res.json({ error: 'missing _id'})
      }
      Issue.findByIdAndDelete(req.body._id, (err, data) => {
        if (data) {
          return res.json({ result: 'successfully deleted', '_id': req.body._id})
        } else {
          return res.json({error: 'could not delete', '_id': req.body._id})
        }
      })
    });
    
};
