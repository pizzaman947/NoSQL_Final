require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI);

const { Product, User, Order } = require('./models/schemas');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token');
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') next();
    else res.status(403).send('Access denied');
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/auth/register', async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already exists');
    const { full_name, email, password } = req.body;
    user = new User({ full_name, email, password, role: 'customer' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    const token = jwt.sign({ _id: user._id, role: user.role, name: user.full_name }, process.env.JWT_SECRET);
    res.send({ token });
});

app.post('/api/auth/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid credentials');
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid credentials');
    const token = jwt.sign({ _id: user._id, role: user.role, name: user.full_name }, process.env.JWT_SECRET);
    res.send({ token });
});

app.get('/api/products', async (req, res) => {
    const { cat, sort } = req.query;
    const sortOrder = sort === 'asc' ? 1 : -1;
    const products = await Product.find(cat ? { category: cat } : {}).sort({ price: sortOrder });
    res.send(products);
});

app.post('/api/products', [auth, isAdmin], async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.send(product);
});

app.delete('/api/products/:id', [auth, isAdmin], async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.send({ success: true });
});

app.put('/api/products/:id/review', auth, async (req, res) => {
    const { rating, comment } = req.body;
    if (rating < 1 || rating > 5) {
        return res.status(400).send('Rating must be between 1 and 5');
    }
    const review = { 
        rating: Number(rating), 
        comment, 
        user: req.user.name 
    };
    await Product.updateOne(
        { _id: req.params.id }, 
        { $push: { reviews: review } }
    );
    res.send({ success: true });
});

app.get('/api/orders', [auth, isAdmin], async (req, res) => {
    const orders = await Order.find()
        .populate('customer_id', 'full_name email')
        .populate('items.product_id', 'model_name price')
        .sort({ order_date: -1 });
    res.send(orders);
});

app.put('/api/orders/:id', [auth, isAdmin], async (req, res) => {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.send({ success: true });
});

app.post('/api/orders', auth, async (req, res) => {
    const order = new Order({ ...req.body, customer_id: req.user._id });
    await order.save();
    await Product.updateMany(
        { _id: { $in: req.body.items.map(i => i.product_id) } },
        { $inc: { stock: -1 } }
    );
    res.send(order);
});

app.get('/api/stats/revenue', [auth, isAdmin], async (req, res) => {
    const stats = await Order.aggregate([
        { $match: { status: "Delivered" } },
        { $unwind: "$items" },
        { $lookup: { 
            from: "products", 
            localField: "items.product_id", 
            foreignField: "_id", 
            as: "pd" 
        } },
        { $unwind: "$pd" },
        { $group: { 
            _id: "$pd.category", 
            total: { $sum: { $multiply: ["$pd.price", "$items.quantity"] } },
            count: { $sum: "$items.quantity" }
        } },
        { $sort: { total: -1 } }
    ]);
    res.send(stats);
});

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});