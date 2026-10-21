const router = require("express").Router();

const productController = require("../../controllers/client/product.controller");


router.get('/', productController.index);
router.get('/api/quick-detail/:slug', productController.quickDetail);
router.get('/api/ai-recommend', productController.aiRecommend);
router.get('/detail/:slug', productController.detail);

module.exports = router;