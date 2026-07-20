const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET;

// --- Helper for creating token ---
const generateToken = (user) => {
    const payload = { id: user._id, email: user.email, fullName: user.fullName };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};

exports.signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).send({ message: 'Missing required fields.' });
    }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).send({ message: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        const token = generateToken(newUser);

        return res.status(201).json({ message:"Registerd Successfully", token, fullName: newUser.fullName, userId: newUser._id });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).send({ message: 'Server error during signup.' });
    }
};

exports.login = async (req, res) => {
    console.log('Login request received');
    console.log('req.body:', req.body);
    console.log('Content-Type header:', req.get('content-type'));
    
    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).send({ message: 'Invalid email.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send({ message: 'Invalid password.' });

        const token = generateToken(user);
        return res.status(200).json({message:"Login Successfully", token, fullName: user.fullName, userId: user._id,  });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).send({ message: 'Server error during login.' });
    }
};
