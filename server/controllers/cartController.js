    const Cart = require("../models/Cart");
    const Product = require("../models/Product");
    const asyncHandler = require("../middleware/asyncHandler");

    // ================= GET USER CART =================
    exports.getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
    });

    // ================= ADD / UPDATE CART =================
    exports.addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({
        user: req.user._id,
        items: [],
        });
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
        // If already exists, UPDATE quantity properly
        cart.items[itemIndex].quantity += quantity;

        if (cart.items[itemIndex].quantity < 1) {
        cart.items.splice(itemIndex, 1);
        }
    } else {
        if (quantity > 0) {
        cart.items.push({
            product: productId,
            quantity,
        });
        }
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
        .populate("items.product");

    res.json(updatedCart);
    });


    // ================= REMOVE FROM CART =================
    exports.removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.json(cart);
    });

