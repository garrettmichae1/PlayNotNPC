// Select the database to use.
use('lifexp');

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('activities');

// Insert a test user
db.users.insertOne({
    email: 'test@example.com',
    password: 'hashedpassword',
    level: 1,
    xp: 0,
    createdAt: new Date()
});

// Insert a test activity
db.activities.insertOne({
    type: 'WORKOUT',
    title: 'Test Workout',
    amount: 50,
    date: new Date(),
    userId: db.users.findOne()._id  // Reference to the test user
});

// Verify data
print('Users:');
printjson(db.users.find().toArray());

print('\nActivities:');
printjson(db.activities.find().toArray());
