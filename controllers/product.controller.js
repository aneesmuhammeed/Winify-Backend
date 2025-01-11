const Product = require('../models/product.model');



const createProduct = async (req,res) => {
  try {
    const product = await Product.create(req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

module.exports ={
  createProduct,
}