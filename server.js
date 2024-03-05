const data = require("./data");

var session = require('express-session')
const express = require("express");
const app = express();
const port = 4000;

app.set("views", "resources");
app.set("view engine", "pug");
app.set("views", "templates");

app.use("/resources", express.static("resources/"));
app.use("/css", express.static("resources/css"));
app.use("/js", express.static("resources/js"));
app.use("/images", express.static("resources/images"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  console.log(req.method + " " + req.url);
  console.log("-----------------------");
  next();
});

// ==============================
// User Authentication
// ==============================

app.get("/", (req, res) => {
  res.status(200).render("user.pug");
});

app.get("/user/signIn", (req, res) => {
  res.status(200).render("logIn.pug");
});

app.post("/user/login", async(req, res) => {
  const result = await data.matchUser(req.body);
  if(result){
    const userId = (await data.find_userId(req.body.userName))[0].userId;
    const userName = (await data.find_userName(userId))[0].user_name;
    if(userId && userName){
      data.user_login(userId, userName);
      req.session.loggedIn = true;
      req.session.userId = userId;
    }
    res.status(301).redirect("/main");
  }
  else{
    const logIn_message = "Invalid username/password";
    res.status(201).render("logIn.pug", {logIn_message});
  }
});

app.get("/user/logIn", (req, res) => {
  res.status(200).render("logIn.pug");
});

app.get("/user/register", (req, res) => {
  res.status(200).render("register.pug");
});

app.post("/user/register", async(req, res)=>{
  try {
    const is_user_in_database = await data.is_userName_exist(req.body.userName);
    if(!is_user_in_database){
      await data.addNewAccount(req.body);
      const confirmation_message = '*Account Successfully Created!';   
      res.status(201).render("logIn.pug", {confirmation_message});
    }
    else{
      const exist_username = '*This username is already taken, please try another one!';
      res.status(201).render("register.pug", {exist_username});
    }
    
  }catch (error) {
    res.status(404).render("404.pug");
  }
});

app.get("/user/guess", async(req, res)=>{
  req.session.guess = true;
  res.status(301).redirect("/main");
});

// ==============================
// Protected Routes 
// ==============================

app.get("/main", (req, res) => {
  res.status(200).render("mainpage.pug");
});

app.get("/menu", (req, res) => {
  if(req.session.loggedIn ){
    res.status(200).render("menu.pug");
  }

  else{
    let message = true;
    res.status(200).render("menu.pug", {message});
  }
  
});

// ==============================
// Cart
// ==============================
app.post("/user/cart", async(req, res)=>{
  if(req.session.loggedIn){
    const get_item = await data.get_menu_item(req.body.item_id);
    const is_item_in_cart = await data.is_item_in_cart(req.body.item_id);
    if(!is_item_in_cart){
      await data.add_item_to_cart(req.body.item_id,req.session.userId,get_item[0].item_name,get_item[0].price);
      res.status(201);
    }
  }
  else{
    res.status(401).render("401.pug");
  }
});

app.get("/cart", async(req, res)=>{
  if(req.session.loggedIn){
    const get_cart = await data.get_cart(req.session.userId);
    res.status(201).render("cart.pug", {get_cart});
  }

  else{
    res.status(401).render("401.pug");
  }

})
app.post("/cart/update", async(req, res)=>{
  await data.update_cart(req.body.cartId,req.body.parse_qty,req.body.total);
  res.status(201);
})

app.delete("/cart/delete", async(req, res)=>{
  await data.delete_cart(req.body.cartId);
  res.status(200);
})

app.delete("/cart/check_out", async(req, res)=>{
  await data.delete_all_cart(req.session.userId);
  res.status(200).redirect("/cart");
});

// ==============================
// Review
// ==============================

app.get("/review", async(req, res)=>{
  if(req.session.loggedIn){
    const cur_page = parseInt(req.params.page) || 1;
    const posts = await data.get_recent_post();
    const user_permit = req.session.userId;
    const get_user_interaction =  await data.get_user_interaction_log(req.session.userId);
    //----------
    if(posts.length > 0){
      for(const i in posts){
        if(posts[i].userId != req.session.userId){
          let check_for_dup = await data.get_interaction_log(posts[i].postId, req.session.userId);
          if(check_for_dup.length == 0){
            await data.add_interaction_log(posts[i].postId, req.session.userId);
          }
        }
      }
    }
    res.status(200).render("reviews.pug", {posts, user_permit, cur_page, get_user_interaction });
  }
  else{
    const cur_page = parseInt(req.params.page) || 1;
    const posts = await data.get_recent_post();
    res.status(200).render("reviews.pug", {posts, cur_page});
  }
});

app.get("/review/post", async(req, res)=>{
  if(req.session.userId && req.session.loggedIn){
    await data.add_post(req.session.userId, req.query.message);
    res.status(301).redirect("/review");
  }
  else{
    res.status(401).render("401.pug");
  }
});

app.post("/review/like",  async(req, res)=>{
  if(req.session.userId && req.body.postId && req.session.loggedIn){
    console.log(req.body.postId, req.session.userId);
    await data.update_like_interaction_log(req.body.postId, req.session.userId);
    const like = true;
    await data.update_like(req.body.postId, like);
  }  
  else{
    res.status(401).render("401.pug");
  }

});

app.delete("/review/like",  async(req, res)=>{ 
  if(req.session.userId && req.body.postId && req.session.loggedIn){
    await data.update_unlike_interaction_log(req.body.postId, req.session.userId);
    const like = false;
    await data.update_like(req.body.postId, like);
  }
  else{
    res.status(401).render("401.pug");
  }
});

app.post("/review/done", async(req, res)=>{
  const {postId,userId, getContent} = req.body;
  if(userId==req.session.userId  && req.session.loggedIn){
    await data.update_post(getContent, postId);
  }
  else{
    res.status(401).render("401.pug");
  }
});

app.delete("/review/delete",async(req, res, next)=>{
  const {postId,userId} = req.body;
  if(userId===req.session.userId){
    await data.delete_post(postId);
  }
  else{
    res.status(401).render("401.pug");
  }
});

//-------------------------------
function random_img(){
  return Math.floor(Math.random() * 15);
}
app.get("/food",async(req, res) => {
  let cur_page = 1;
  const key =
          "Ujl7dSqiNvj02lnA79SA7388778FAzsmKqcL7sEBLDvoHCpYIDvXktMP";
  const url = `https://api.pexels.com/v1/search?query=italian+food&page=${cur_page}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: key,
      },
    });

    const json = await response.json();
    cur_page = Math.floor(Math.random() * 50) + 1; 
    const imgs = [];
    if (json.photos && json.photos.length > 0) {
      for (let i = 0; i < 4; i++) {
        imgs.push(json.photos[random_img()].src.original);
      }
    }
    res.setHeader('Set-Cookie', 'SameSite=None;');

    res.status(200).render("savorMemories.pug", {imgs});
  } catch (error) {
    console.error("Error");
    res.status(401).render("401.pug");
  }

  
});

// add logoutPage
app.get("/user/logOut", async(req, res) => {
  if(req.session.loggedIn && req.session.userId != -1){
    const userName = (await data.find_userName(req.session.userId))[0].user_name;
    await data.user_logout(req.session.userId,userName);
    req.session.loggedIn = false;
    req.session.userId = -1;
    res.status(200).render("logOut.pug");
  }
  else{
    req.session.guess = false;
    res.status(200).send("Thank you for visitting!");
  }
}); 

app.use((req, res, next) => {
  res.status(404).render("404.pug");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});