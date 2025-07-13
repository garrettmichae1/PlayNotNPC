const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    totalXP: {
        type: Number,
        default: 0
    },
    streakCount: {
        type: Number,
        default: 0
    },
    lastActivity: {
        type: Date
    },
    unlockedAchievements: [{
        type: String,
        default: []
    }],
    lastAchievementCheck: {
        type: Date,
        default: Date.now
    },
    stats: {
        totalWorkouts: { type: Number, default: 0 },
        totalWorkMinutes: { type: Number, default: 0 },
        totalStudyHours: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Debug middleware for all operations
userSchema.pre('save', function(next) {
    console.log('\n=== USER PRE-SAVE MIDDLEWARE START ===');
    console.log('Saving user with email:', this.email);
    console.log('Is new user?', this.isNew);
    console.log('Modified paths:', this.modifiedPaths());
    next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        console.log('\n=== PASSWORD HASHING START ===');
        
        if (!this.isModified('password')) {
            console.log('Password not modified, skipping hashing');
            return next();
        }
        
        console.log('Generating salt...');
        const salt = await bcrypt.genSalt(10);
        console.log('Salt generated successfully');
        
        console.log('Hashing password...');
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Password hashed successfully');
        
        console.log('=== PASSWORD HASHING END ===\n');
        next();
    } catch (error) {
        console.error('\n=== PASSWORD HASHING ERROR ===');
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        console.error('=== PASSWORD HASHING ERROR END ===\n');
        next(error);
    }
});

userSchema.post('save', function(doc, next) {
    console.log('\n=== USER POST-SAVE MIDDLEWARE ===');
    console.log('User saved successfully:', {
        email: doc.email,
        username: doc.username,
        id: doc._id
    });
    console.log('=== USER POST-SAVE MIDDLEWARE END ===\n');
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('\n=== PASSWORD COMPARISON START ===');
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password comparison result:', isMatch);
        console.log('=== PASSWORD COMPARISON END ===\n');
        return isMatch;
    } catch (error) {
        console.error('\n=== PASSWORD COMPARISON ERROR ===');
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        console.error('=== PASSWORD COMPARISON ERROR END ===\n');
        throw new Error('Password comparison failed');
    }
};

const User = mongoose.model('User', userSchema);

// Create indexes with logging
User.createIndexes()
    .then(() => console.log('User indexes created successfully'))
    .catch(err => {
        console.error('\n=== INDEX CREATION ERROR ===');
        console.error('Error details:', {
            name: err.name,
            message: err.message,
            code: err.code,
            stack: err.stack
        });
        console.error('=== INDEX CREATION ERROR END ===\n');
    });

module.exports = User;
