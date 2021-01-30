const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('/api/issues/{projects}', () => {

    test('Every fields filled in', (done) => {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Test',
          issue_text: 'Testing',
          created_by: 'Me',
          assigned_to: 'You',
          status_text: 'Active'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test');
          assert.equal(res.body.issue_text, 'Testing');
          assert.equal(res.body.created_by, 'Me');
          assert.equal(res.body.assigned_to, 'You');
          assert.equal(res.body.status_text, 'Active');
          assert.exists(res.body.created_on);
          assert.exists(res.body.updated_on);
          assert.equal(res.body.open, true);
          assert.property(res.body, '_id');
          testId = res.body._id;
          done();
        });
    });

    test('Only required fields filled in', (done) => {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Test',
          issue_text: 'Testing',
          created_by: 'Me'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test');
          assert.equal(res.body.issue_text, 'Testing');
          assert.equal(res.body.created_by, 'Me');
          assert.exists(res.body.created_on);
          assert.exists(res.body.updated_on);
          assert.equal(res.body.open, true);
          assert.property(res.body, '_id');
          done();
        })
    });

    test('Missing required field(s)', (done) => {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Test',
          issue_text: 'Testing'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"required field(s) missing"}')
          done();
        })
    });

    test('View all issues on a project', (done) => {
      chai.request(server)
        .get('/api/issues/apitest')
        .query({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'open');
          done();
        })
    })

    test('View issues with one filter', (done) => {
      chai.request(server)
      .get('/api/issues/apitest')
      .query({issue_title: 'Test'})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body[0].issue_title, 'Test');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], '_id');
        assert.property(res.body[0], 'open');
        done();
      })
    })

    test('View issues with multiple filters', (done) => {
      chai.request(server)
      .get('/api/issues/apitest')
      .query({
        issue_title: 'Test', 
        issue_text: 'Testing'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body[0].issue_title, 'Test');
        assert.equal(res.body[0].issue_text, 'Testing')
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], '_id');
        assert.property(res.body[0], 'open');
        done();
      })
    })

    test('Update one field', (done) => {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: testId,
          issue_title: 'Update'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"result":"successfully updated","_id":"' + testId + '"}')
          done();
        })
    })

    test('Update multiple fields', (done) => {
      chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: testId,
        issue_title: 'Update',
        issue_text: 'update test'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"result":"successfully updated","_id":"' + testId + '"}')
        done();
      })
    })

    test('Update with missing id', (done) => {
      chai.request(server)
      .put('/api/issues/apitest')
      .send({_id: ''})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"missing _id"}');
        done();
      })
    })

    test('Update issue with no fields', (done) => {
      chai.request(server)
      .put('/api/issues/apitest')
      .send({_id: testId})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"no update field(s) sent","_id":"' + testId + '"}');
        done();
      })
    })

    test('Update with invalid id', (done) => {
      chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: 'randomTestId123',
        issue_text: 'fail update'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"could not update","_id":"randomTestId123"}');
        done();
      })
    })

    test('Delete an issue', (done) => {
      chai.request(server)
      .delete('/api/issues/apitest')
      .send({_id: testId})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"result":"successfully deleted","_id":"' + testId + '"}')
        done();
      })
    })

    test('Delete an issue with invalid id', (done) => {
      chai.request(server)
      .delete('/api/issues/apitest')
      .send({_id: 'randomTestId123'})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"could not delete","_id":"randomTestId123"}')
        done();
      })
    })

    test('Delete an issue with missing id', (done) => {
      chai.request(server)
      .delete('/api/issues/apitest')
      .send({_id: ''})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"missing _id"}')
        done();
      })
    })
  })
});
