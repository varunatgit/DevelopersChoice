var express=require("express"),
    bodyParser=require("body-parser"),
    mongoose=require("mongoose"),
    passport=require("passport"),
    LocalStratergy=require("passport-local"),
    passportLocalMongoose=require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/desserts1",{ useNewUrlParser:
true });

var userSchema=new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    technology:String,
    level:String

});

userSchema.plugin(passportLocalMongoose);

User=mongoose.model("User",userSchema);


var app=express();


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(passport.initialize());
app.use(passport.session());
app.use(require("express-session")({
    secret:"hello World",
    resave: false,
    saveUninitialized: false
}));

passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//Schema
var itemSchema = new mongoose.Schema({
    name: String,
    description: String,
    level: String,
    technology: String
});

var desserts = mongoose.model("desserts",itemSchema);


app.get("/",function(req,res){
    //res.send("Winter will be here soon ;(");
    res.render("anime.ejs");
});

app.get("/main",function(req,res){
    //res.send("Winter will be here soon ;(");
    res.render("main.ejs");
});

app.get("/login",function(req,res){
    res.render("login.ejs");
});

app.post('/login',passport.authenticate("local" ,{
    successRedirect: '/desserts',
    failureRedirect: '/login'
}),function(req,res){
});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/main")
})

app.get("/signup",function(req,res){
    res.render("signup.ejs");
});

app.post('/signup', function(req,res){

     var newUser =new User({ username: req.body.username});

    User.register(newUser, req.body.password,function(err, user){
        if(err){
            console.log(err);
            return res.render("signup");
        }
          passport.authenticate("local")(req,res,function(){
            res.redirect("/desserts");
          });

    });
});



app.get("/desserts",function(req,res) {

  console.log(req.user);
    desserts.find( {}, function(err, alldesserts){
        if(err){
            console.log(err);
        } else {
            res.render("desserts",{desserts : alldesserts});
        }
    });
});



app.post("/desserts",isLoggedIn, function(req, res){
    //res.send("It was the post route.")


    var name = req.body.name;
    var description = req.body.description;
    var level = req.body.level;
    var technology = req.body.technology;

    var newdessert = {name: name, description: description, level: level, technology:technology}
    desserts.create(newdessert, function(err, newlyCreadted){
        if(err){
            console.log(err);
        } else {
            res.redirect("/desserts");
        }
    })
});



app.get("/desserts/new",function(req,res){
    res.render("new.ejs");
});

//dadadsdadd
app.get("/desserts/:id", function(req,res){
  desserts.findById(req.params.id, function(err,foundproject){
     if(err){
       console.log(err);
            }
    else {
      res.render("show",{ desserts : foundproject});
    }
  })
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, "localhost" , function() {
    console.log("Server started");
});
