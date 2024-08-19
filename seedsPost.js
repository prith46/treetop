const Userpost = require('./userpost');

const seedpostdb = async () => {
    const post1 = new Userpost ({
        username: 'Admin',
        post: 'Test post1',
        caption: 'This is the first test post'
    })
    await post1.save()
    .catch(() => {
        console.log("Error in adding post1");
    });

    const post2 = new Userpost ({
        username: 'Test1',
        post: 'Test post2',
        caption: 'This is the second test post'
    })
    await post2.save()
    .catch(() => {
        console.log("Error in adding post2");
    });

    const post3 = new Userpost ({
        username: 'Test2',
        post: 'Test post2',
        caption: 'This is the third test post'
    })
    await post3.save()
    .catch(() => {
        console.log("Error in adding post3");
    })
}

seedpostdb();
