const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    tokens: { type: Number, default: 1000 },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tasks: [{
        description: String,
        completed: { type: Boolean, default: false }
    }],
    notionDetails: {
        access_token: String,
        bot_id: String,
        duplicated_template_id: String,
        owner: {
          workspace: Boolean,
        },
        workspace_icon: String,
        workspace_id: String,
        workspace_name: String
      },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// implement the toJSON method to remove the password field when converting to JSON
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

// implement check if user exists
userSchema.statics.userExists = async function (email) {
    const user = await this.findOne( { email });
    return user;
};



module.exports = mongoose.model('User', userSchema);

