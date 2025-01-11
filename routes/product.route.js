const express = require("express");
const Product = require("../models/product.model.js");
const router = express.Router(); 
const {createProduct} = require('../controllers/product.controller.js');

router.post("/",createProduct);

module.exports = router