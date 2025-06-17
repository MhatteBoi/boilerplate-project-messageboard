'use strict';

// Local storage for boards, threads and replies
const boards = new Map(); 

// Helper function to generate unique IDs
const generateId = () => Date.now().toString();

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get((req, res) => {
      const board = req.params.board;
      const threads = boards.get(board) || [];
      res.json(threads);
    })
    .post((req, res) => {
      const board = req.params.board;
      const { text, delete_password } = req.body;
      
      const newThread = {
        _id: generateId(),
        text,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password,
        replies: [],
        replycount: 0
      };

      if (!boards.has(board)) {
        boards.set(board, []);
      }
      
      boards.get(board).unshift(newThread);
      res.redirect(`/b/${board}/`);
    })
    .delete((req, res) => {
      const board = req.params.board;
      const { thread_id, delete_password } = req.body;
      
      const threads = boards.get(board);
      const threadIndex = threads?.findIndex(t => t._id === thread_id);
      
      if (threadIndex === -1) return res.send('thread not found');
      
      if (threads[threadIndex].delete_password === delete_password) {
        threads.splice(threadIndex, 1);
        res.send('success');
      } else {
        res.send('incorrect password');
      }
    })
    .put((req, res) => {
      const board = req.params.board; 
      const { report_id } = req.body;
      
      const threads = boards.get(board);
      const thread = threads?.find(t => t._id === report_id);
      
      if (!thread) return res.send('thread not found');
      
      thread.reported = true;
      res.send('reported');
    });
    
  app.route('/api/replies/:board')
    .get((req, res) => {
      const board = req.params.board;
      const { thread_id } = req.query;
      
      const threads = boards.get(board);
      const thread = threads?.find(t => t._id === thread_id);
      
      if (!thread) return res.send('thread not found');
      res.json(thread);
    })
    .post((req, res) => {
      const board = req.params.board;
      const { thread_id, text, delete_password } = req.body;
      
      const threads = boards.get(board);
      const thread = threads?.find(t => t._id === thread_id);
      
      if (!thread) return res.send('thread not found');

      const newReply = {
        _id: generateId(),
        text,
        created_on: new Date(),
        delete_password,
        reported: false
      };
      
      thread.replies.push(newReply);
      thread.replycount = thread.replies.length;
      thread.bumped_on = new Date();

      res.redirect(`/b/${board}/${thread_id}`);
    })
    .delete((req, res) => {
      const board = req.params.board;
      const { thread_id, reply_id, delete_password } = req.body;
      
      const threads = boards.get(board);
      const thread = threads?.find(t => t._id === thread_id);
      
      if (!thread) return res.send('thread not found');
      
      const reply = thread.replies.find(r => r._id === reply_id);
      if (!reply) return res.send('reply not found');
      
      if (reply.delete_password === delete_password) {
        reply.text = '[deleted]';
        res.send('success');
      } else {
        res.send('incorrect password');
      }
    })
    .put((req, res) => {
      const board = req.params.board;
      const { thread_id, reply_id } = req.body;
      
      const threads = boards.get(board);
      const thread = threads?.find(t => t._id === thread_id);
      
      if (!thread) return res.send('thread not found');
      
      const reply = thread.replies.find(r => r._id === reply_id);
      if (!reply) return res.send('reply not found');
      
      reply.reported = true;
      res.send('reported');
    });
};