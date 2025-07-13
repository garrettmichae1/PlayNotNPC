const express = require('express');
const app = express();

app.use(express.json());

console.log('Express version:', require('express/package.json').version);

// Test basic route
app.get('/test', (req, res) => {
    res.json({ message: 'Basic route working' });
});

// Test API route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API route working' });
});

// Add users route
console.log('Loading users route...');
app.use('/api/users', require('./routes/users'));

app.listen(5002, () => {
    console.log('Debug server running on port 5002');
}); 