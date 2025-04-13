const express = require('express');
const router = express.Router();
const codingChallengeController = require('../controllers/codingChallengeController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/', codingChallengeController.getChallenges);
router.get('/:id', codingChallengeController.getChallenge);

// Protected routes
router.use(auth);
router.post('/run', codingChallengeController.runCode);
router.post('/:id/submit', codingChallengeController.submitSolution);
router.get('/:id/hints', codingChallengeController.getHints);

// Admin routes
router.use(adminAuth);
router.post('/', codingChallengeController.createChallenge);
router.put('/:id', codingChallengeController.updateChallenge);

module.exports = router; 