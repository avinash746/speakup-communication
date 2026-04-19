const express = require('express');
const { getHistory, toggleFavorite, deleteAnalysis, getStats } = require('../controllers/history.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/', getHistory);
router.get('/stats', getStats);
router.patch('/:id/favorite', toggleFavorite);
router.delete('/:id', deleteAnalysis);

module.exports = router;
