const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl).then(() => {
    console.log("Connection is up in app");
}).catch((error) => {
    console.log(error);
})


const userdetailsSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'email is required']
    },
    name: {
        type: String,
        required: [true, 'name is required']
    },
    mobile: {
        type: Number,
        required: [true, 'Mobile Number is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }

});

userdetailsSchema.statics.findAndValidate = async function (email, password) {
    try {
        const foundUser = await this.findOne({ email });
        if (!foundUser) {
            console.error('User not found for email:', email);
            return false;
        }
        const isValid = await bcrypt.compare(password, foundUser.password);
        console.log(`Password validation result: ${isValid}`);
        return isValid ? foundUser : false;
    } catch (error) {
        console.error('Error during validation:', error);
        return false;
    }
}

userdetailsSchema.statics.findUserAndUpdate = async function (email, password, mobile) {
    try {
        const foundUser = await this.findOne({ email });
        if (!foundUser) {
            console.error("User not found for email:", email);
            return false;
        }
        if (foundUser.mobile == mobile) {
            foundUser.password = password;
            await foundUser.save();
            console.log("Password updated in database");
            return true;
        }
        else {
            console.log("Mobile verification failed");
            return false;
        }
    } catch (error) {
        console.error('Error updating password:', error);
        return false;
    }
}

userdetailsSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = mongoose.model('Userdetails', userdetailsSchema);
