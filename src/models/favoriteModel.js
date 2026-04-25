import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Favorite must belong to a user'],
        unique: true // One favorite list per user
    },
    properties: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property'
        }
    ]
}, {
    timestamps: true
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
