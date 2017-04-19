const mongoose = require('mongoose');
const Role=mongoose.model('Role');
const ObjectId=mongoose.Schema.Types.ObjectId;
const encryption = require('./../utilities/encryption');

let userSchema = mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        passwordHash: {type: String, required: true},
        fullName: {type: String, required: true},
        isAdmin: false,
        articles: [{type: ObjectId, ref:'Article'}],
        roles: [{type: ObjectId, ref:'Role'}],
        salt: {type: String, required: true},
    }
);


userSchema.method ({
    authenticate: function (password) {
        let inputPasswordHash = encryption.hashPassword(password, this.salt);
        let isSamePasswordHash = inputPasswordHash === this.passwordHash;

        return isSamePasswordHash;
    }});

userSchema.method({
    isAuthor: function (article){
        if(!article){
            return false;
        }

        let id=article.author;

        if(article.author.id){
            id=article.author.id;
        }

        return isAuthor=article.author.equals(this.id);

    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.initialize=()=>{
    let email='admin@mysite.com';
    User.findOne({email:email}).then(admin=>{
        if(admin){
            return;
        }

        Role.findOne({name:'Admin'}).then(role=>{
            if(!role){
                return;
            }
            let salt = encryption.generateSalt();
            let passwordHash = encryption.hashPassword('admin123', salt);

            let adminUser={
                email:email,
                fullName:'Admin',
                roles:[role.id],
                isAdmin:true,
                articles:[],
                salt:salt,
                passwordHash:passwordHash
                }
                User.create(adminUser).then(user=>{
                    role.users.push(user.id);
                    role.save();
                });
        });


    });
}