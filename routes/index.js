const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index', { title: 'Aard_v2 API Server' });
  });
module.exports = router;
