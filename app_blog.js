// Remember to install all the packages 
// Setup of express
var express = require("express");
var app = express();

// Setup of body-parser
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended : true}));

//Setup of method-override
var methodOverride = require("method-override");
app.use(methodOverride("_method"));

// Setup of Sanitzer , note sanitizer should be after bodyParser 
var expressSanitizer = require("express-sanitizer");
app.use(expressSanitizer());

// view engine
app.set("view engine","ejs");
// express static
app.use(express.static("public"));

// Setup of mongoose 
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/restful_blog_app', { useNewUrlParser: true });

// Setup of Blog Schema and config of model
var blogSchema = new mongoose.Schema({
	title : String,
	image : String,
	text  : String,
	created: {
		type: Date, 
		default: Date.now
	}
});
var blog = mongoose.model("blog", blogSchema);

// Sample post inside DB
// blog.create({
// 	title: "Test Blog",
// 	image: "https://d3icht40s6fxmd.cloudfront.net/sites/default/files/test-product-test.png",
// 	text: "This is a test blog post"
// });

// RESTFUL Routes : 

// INDEX Route
app.get("/",function(req,res){
	res.redirect("/blogs");
});

app.get("/blogs",function(req,res){
	blog.find({}, function(err, allblogs){
		if(err){
			console.log("Error!");
		}
		else{
			res.render("index", {blogs : allblogs});
		}
	});
	
});

// NEW ROUTE
app.get("/blogs/new", function(req,res){
	res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req,res){
	// create blog
	req.body.blog.text = req.sanitize(req.body.blog.text);
	blog.create(req.body.blog, function(err, newBlog){
		if(err){
			console.log("Error!");
			console.log(err);
			res.render("new");
		}
		else{
		console.log("User Data created");
		console.log(newBlog);
		// redirect back to the index for now 
		res.redirect("/blogs");
		}
	});
	
   });

// SHOW ROUTE

 app.get("/blogs/:id", function(req,res){
		blog.findById(req.params.id, function(err, foundBlog){
			if(err){
				console.log("Error");
				console.log(err);
				res.redirect("/blogs");
			}
			else{
				res.render("show",{blogid : foundBlog});
			}
		});						 
		});


// EDIT ROUTE

app.get("/blogs/:id/edit", function(req,res){
	blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			console.log(err);
		 	res.redirect("/blogs");
		 }
		 else{
			res.render("edit",{blogid : foundBlog});
		 }
	});
});

// UPDATE ROUTE

app.put("/blogs/:id", function(req,res){
	req.body.blog.text = req.sanitize(req.body.blog.text);
	blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else{ 
			res.redirect("/blogs/" + req.params.id);
		}  
	});
	
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req,res){
	//destroy blog 
	blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");
		}
	});
	// redirect somewhere
});




//Connecting to Server 
app.listen(3000, function(req,res){
	console.log("Blog Server is up!");
});

