const Userdetails = require('./userdetails');

const seeddb = async () => {
    const user1 = new Userdetails ({
        email: 'admin@gmail.com',
        name: 'Admin',
        password: '12345',
        mobile: 12345
    })
    await user1.save()
    .catch(() => {
        console.log("Error in adding admin user");
    })

    const user2 = new Userdetails ({
        email: 'test1@gmail.com',
        name: 'test1',
        password: '12345',
        mobile: 12345
    })
    await user2.save()
    .catch(() => {
        console.log("Error in adding test1 user");
    })

    const user3 = new Userdetails ({
        email: 'test2@gmail.com',
        name: 'test2',
        password: '12345',
        mobile: 12345
    })
    await user3.save()
    .catch(() => {
        console.log("Error in adding test2 user");
    })
}

seeddb()