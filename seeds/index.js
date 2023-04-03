const mongoose = require('mongoose');//create mongoose.
const cities = require('./cities')
const Campground = require('../models/campground');
const { descriptors, places } = require('./seedhelper');

//connect mongoose to Mongo.
mongoose.connect('mongodb://localhost:27017/yelpcampDB');

//check if db is connected.
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>{
    console.log("Database is connected")
})

const randUnit = arr => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        console.log(i);
        const rand1000 = Math.floor(Math.random()*1000);
        const camp = new Campground({
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${randUnit(descriptors)}, ${randUnit(places)}`,
            image: "https://source.unsplash.com/random/9564785",
            description: "Nice",
            price: 200
        })
    
    await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})