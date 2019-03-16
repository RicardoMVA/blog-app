var express          = require("express"),
	app 	         = express(),
	bodyParser       = require("body-parser"),
	mongoose  	     = require("mongoose"),
	methodOverride   = require("method-override"),
	expressSanitizer = require("express-sanitizer");

// APP CONFIG
app.set("view engine", "ejs");

// this allows the use of "public" folder
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));

// use this to make PUT and DELETE requests
app.use(methodOverride("_method"));

// use this to prevent javascript from being run through forms
// this line must come after the body-parser 'use' line
app.use(expressSanitizer());


// MONGOOSE/MODEL CONFIG
// Deprecation fixes done as suggested in the docs
// https://mongoosejs.com/docs/deprecations.html
mongoose.set('useCreateIndex', true);

mongoose.set('useFindAndModify', false);

let url = "mongodb://localhost/restful_blog_app"

mongoose.connect(url, {useNewUrlParser:true});

var blogSchema = new mongoose.Schema({
	title: String,
	// to determine a fallback if user input is invalid, do this
	// it will place the 'default' object if user input doesn't
	// respect the 'type' defined
	image: {type: String, default: "placeholderimg.jpg"},
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);


// RESTFUL ROUTES

app.get("/", function(req, res){
	res.redirect("/blogs");
});


// INDEX
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if (err) {
			console.log("Something went wrong showing the blogs");
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	})
});


// NEW
app.get("/blogs/new", function(req, res){
	res.render("new");
});



// CREATE
app.post("/blogs", function(req, res){
	// this line sanitizes the 'blog text' form, removing any script 
	// tags while still allowing for HTML to be used in the form
	req.body.blog.body = req.sanitize(req.body.blog.body);

	// req.body.blog retrieves all the "blog" inputs, divided
	// by each category in the []
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			console.log("Something went wrong when creating the blog");
			console.log(err);
			res.render("new");
		} else {
			// redirect to INDEX
			res.redirect("/blogs");
		}
	});
})


// SHOW
app.get("/blogs/:id", function(req, res){
	// find by ID specific blog to show
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			console.log("Something went wrong when finding the blog");
			console.log(err);
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});


// EDIT
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			console.log("Something went wrong when editing the blog");
			console.log(err);
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});


// UPDATE
app.put("/blogs/:id", function(req, res){
	// this line sanitizes the 'blog text' form, removing any script 
	// tags while still allowing for HTML to be used in the form
	req.body.blog.body = req.sanitize(req.body.blog.body);
	
	// findByIdAndUpdate(id, newData, callback)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err) {
			console.log("Something went wrong when updating the blog");
			console.log(err);
			res.redirect("/blogs");
		} else {
			// go back to post details, with the update done
			res.redirect("/blogs/" + req.params.id);
		}
	});
});


// DESTROY
app.delete("/blogs/:id", function(req, res){
	// destroy blog from database
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log("Could not delete the blog");
		} else {
			res.redirect("/blogs");
		}
	});
});


app.listen(3000, function(){
	console.log("Blog App server running on localhost:3000");
});