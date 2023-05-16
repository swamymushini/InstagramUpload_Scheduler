const mongoose = require('mongoose');
const axios = require('axios');

let connection = null;

const postSchema = new mongoose.Schema({
    heading: String,
    imageText: String,
    sent: Boolean
});

const Posts = mongoose.model('Post', postSchema);

exports.handler = async (event) => {
    if (event.type === 'SCHEDULE') {
        try {
            if (connection == null) {
                connection = await mongoose.connect('mongodb+srv://swamymushini:moNEWSS3**@cluster0.csitgbh.mongodb.net/InstagramPosts', {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                });
            }

            const payload = event.payload;

            const newPost = new Posts({
                heading: payload.heading,
                imageText: payload.imageText,
                sent: false
            });

            const savedPost = await newPost.save();
            console.log('scheduled - ' + savedPost);
            return savedPost;
        } catch (error) {
            console.log(error);
            return error;
        }
    } else if (event.type === 'POSTNOW') {
        try {
            if (connection == null) {
                connection = await mongoose.connect('mongodb+srv://swamymushini:moNEWSS3**@cluster0.csitgbh.mongodb.net/InstagramPosts', {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                });
            }

            const oldestPost = await Posts.findOne({ sent: false }).sort({ createdAt: 1 });

            if (!oldestPost) {
                console.log('No new posts in DB to upload in Instagram');
                return;
            }

            const data = {
                heading: oldestPost.heading,
                imageText: oldestPost.imageText
            };

            const response = await axios.post('https://u411m4oucg.execute-api.us-east-1.amazonaws.com/dev', data);

            if (response.status === 200) {
                oldestPost.sent = true;
                await oldestPost.save();
                console.log('Post sent - ' + oldestPost);
            }
        } catch (error) {
            console.log(error);
        }
    }
};
