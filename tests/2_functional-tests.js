const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testThreadId;
  let testReplyId;
  const testBoard = 'test';
  const threadPassword = 'test123';
  const replyPassword = 'reply123';

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    test('POST new thread', function(done) {
      chai.request(server)
        .post(`/api/threads/${testBoard}`)
        .send({
          text: 'Test Thread',
          delete_password: threadPassword
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.redirects[0].split('/').pop(), testBoard);
          done();
        });
    });

    test('GET 10 most recent threads with 3 replies each', function(done) {
      chai.request(server)
        .get(`/api/threads/${testBoard}`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length, 10);
          if (res.body.length > 0) {
            testThreadId = res.body[0]._id;
            assert.isAtMost(res.body[0].replies.length, 3);
          }
          done();
        });
    });

    test('DELETE thread with incorrect password', function(done) {
      chai.request(server)
        .delete(`/api/threads/${testBoard}`)
        .send({
          thread_id: testThreadId,
          delete_password: 'wrongpassword'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('Report thread', function(done) {
      chai.request(server)
        .put(`/api/threads/${testBoard}`)
        .send({
          report_id: testThreadId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
    });

    test('DELETE thread with correct password', function(done) {
      chai.request(server)
        .delete(`/api/threads/${testBoard}`)
        .send({
          thread_id: testThreadId,
          delete_password: threadPassword
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });
  });

  suite('API ROUTING FOR /api/replies/:board', function() {
    
    // Create a new thread for reply tests
    before(function(done) {
      chai.request(server)
        .post(`/api/threads/${testBoard}`)
        .send({
          text: 'Test Thread for Replies',
          delete_password: threadPassword
        })
        .end(function(err, res) {
          chai.request(server)
            .get(`/api/threads/${testBoard}`)
            .end(function(err, res) {
              testThreadId = res.body[0]._id;
              done();
            });
        });
    });

    test('POST new reply', function(done) {
      chai.request(server)
        .post(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThreadId,
          text: 'Test Reply',
          delete_password: replyPassword
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });

    test('GET thread with all replies', function(done) {
      chai.request(server)
        .get(`/api/replies/${testBoard}`)
        .query({ thread_id: testThreadId })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'replies');
          if (res.body.replies.length > 0) {
            testReplyId = res.body.replies[0]._id;
          }
          done();
        });
    });

    test('DELETE reply with incorrect password', function(done) {
      chai.request(server)
        .delete(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: 'wrongpassword'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('Report reply', function(done) {
      chai.request(server)
        .put(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
    });

    test('DELETE reply with correct password', function(done) {
      chai.request(server)
        .delete(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: replyPassword
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });
  });
});