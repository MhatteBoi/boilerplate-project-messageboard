import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server.js';

const assert = chai.assert;
chai.use(chaiHttp);

let testThreadId;
let testReplyId;
const testBoard = 'test';
const threadPassword = 'test123';
const replyPassword = 'reply123';

suite('Functional Tests', function() {


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
          thread_id: testThreadId
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
    before(function(done) {
      chai.request(server)
        .post(`/api/threads/${testBoard}`)
        .send({
          text: 'Thread for reply tests',
          delete_password: threadPassword
        })
        .end(function(err, res) {
          chai.request(server)
            .get(`/api/threads/${testBoard}`)
            .end(function(err, res) {
              // Find the thread we just created (should be first)
              replyThreadId = res.body[0]._id;
              done();
            });
        });
    });

    test('POST new reply', function(done) {
      chai.request(server)
        .post(`/api/replies/${testBoard}`)
        .send({
          thread_id: replyThreadId,
          text: 'A reply',
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
        .query({ thread_id: replyThreadId })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'replies');
          replyId = res.body.replies[0]._id;
          done();
        });
    });

    test('DELETE reply with incorrect password', function(done) {
      chai.request(server)
        .delete(`/api/replies/${testBoard}`)
        .send({
          thread_id: replyThreadId,
          reply_id: replyId,
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
          thread_id: replyThreadId,
          reply_id: replyId
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
          thread_id: replyThreadId,
          reply_id: replyId,
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