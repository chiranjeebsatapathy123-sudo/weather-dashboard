const express = require('express');
const agentsRouter = require('./agents');
const toolsRouter = require('./tools');
const decisionsRouter = require('./decisions');
const governanceRouter = require('./governance');

const router = express.Router();

router.use('/agents', agentsRouter);
router.use('/tools', toolsRouter);
router.use('/decisions', decisionsRouter);
router.use('/governance', governanceRouter);

module.exports = router;
