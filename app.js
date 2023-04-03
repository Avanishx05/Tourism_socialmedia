const express = require('express');//connect to express.
const path = require('path');//get path option from node.
const methodOverride = require('method-override');

const mongoose = require('mongoose');//create mongoose.

const asyncErrorHandler = require('./utils/asynErrorHandler');
const ErrorHandler = require('./utils/ErrorHandler');
const { campgroundSchema } = require('./schemas');
const engine = require('ejs-mate');
const Campground = require('./models/campground');

//connect mongoose to Mongo.
mongoose.connect('mongodb://localhost:27017/yelpcampDB');

//check if db is connected.
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>{
    console.log("Database is connected")
})

//create app server
const app = express();

//set view engine to ejs and views to our views directory.
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.urlencoded({extended: true}));//parse body.
app.use(methodOverride('_method'));//override a method.

const validateEntry = (req, res, next) => {
    const result = campgroundSchema.validate(req.body);
    if(result.error) {
        const msg = result.error.details.map(el => el.message).join(',');
        throw new ErrorHandler(msg, 400);
    }
    else{
        next();
    }
}

//home page
app.get('/',(req,res) =>{
    res.render('home')
});

//display list of all campgrounds.
app.get('/campgrounds', async (req,res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
});

//Create a new campground.
app.get('/campgrounds/new',(req,res) =>{
    res.render('campgrounds/new');
});

//post the new campground
app.post('/campgrounds/', validateEntry, asyncErrorHandler(async (req,res) =>{
    //if(!req.body.campground) throw new ErrorHandler('Invalid campground data', 400);
    
    const campground = new Campground(req.body.campground);
    console.log(req.body.campground)
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`)
}));


//show selected campground.
app.get('/campgrounds/:id', async (req,res) =>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
});

app.get('/campgrounds/:id/edit', async (req,res) =>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
});

//editing campgrounds
app.put('/campgrounds/:id', validateEntry, asyncErrorHandler(async (req,res) =>{
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);

}));

app.delete('/campgrounds/:id', async(req,res)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
});

//error handling for all paths
app.all('*',(req,res,next) =>{
    next(new ErrorHandler('Page not found!', 404))
});

//error handling
app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Oops! Something went wrong"
    res.status(statusCode).render('error', {err});
})

app.listen(3000,() => {
    console.log('Serving on port 3000')
});