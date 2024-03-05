const mysql = require(`mysql-await`);

// Code adapted from https://www.npmjs.com/package/bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

var connPool = mysql.createPool({
  connectionLimit: 5,
  host: "cse-mysql-classes-01.cse.umn.edu",
  user: "C4131F23U20",
  database: "C4131F23U20",
  password: "450",
});

async function get_User(){
  return await connPool.awaitQuery('SELECT * FROM user_auth');
}

//---------------------------------------
// LOG IN FEATURE 
// Check to see if the username and password match
async function matchUser(data){
  try{
    const getUser = await connPool.awaitQuery(`SELECT user_name, user_password_hash FROM user_auth WHERE user_name = ?`, [data.userName]);
    const result =  bcrypt.compareSync(data.password,getUser[0].user_password_hash); 
    if(result){
      return true;
    }
    return false;
  }catch (error) {
    console.error("Error");
  }
 
}

async function user_login(userId, user_name){
  await connPool.awaitQuery(`INSERT INTO logIn (userId,user_name, user_login) VALUES (?,?,?)`, [userId, user_name, new Date()]);
}
async function user_logout(userId, user_name){
  await connPool.awaitQuery(`INSERT INTO logIn (userId,user_name,user_logout) VALUES (?,?,?)`, [userId,user_name,new Date()]);
}
async function find_userId(userName){
  const getUserId = await connPool.awaitQuery('SELECT userId FROM user_auth WHERE user_name =?', userName);
  return getUserId;
}

async function get_userId(userId){
  return await connPool.awaitQuery('SELECT userId FROM user_auth WHERE userId !=?', [userId]);
}
async function is_userName_exist(userName){
  const getUser = await connPool.awaitQuery(`SELECT user_name FROM user_auth WHERE user_name = ?`, userName);
  if(getUser.length > 0){
    return true;
  }
  return false;
}

async function addNewAccount(data){
  try {
    // insert data into user table
    const add_to_user = `INSERT INTO user (full_name , email) VALUES (?,?)`;
    const user_val = [data.fname, data.email];
    const user = await connPool.awaitQuery(add_to_user, user_val);

    const last_index = await connPool.awaitQuery(`SELECT LAST_INSERT_ID() as id FROM user;`);
    const index = last_index[0].id;

    // bcrypt hashed password
    const hashed_password = await bcrypt.hash(data.password, saltRounds);

    // insert data into user_auth table
    const add_to_user_auth = `INSERT INTO user_auth (userId, user_name, user_password_hash) VALUES (?,?,?)`;
    const user_auth_val = [index, data.userName, hashed_password];
    const user_auth = await connPool.awaitQuery(add_to_user_auth, user_auth_val);

    if(user.length > 0 && user_auth.length>0){
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error");
  }
}
//---------------------------------------

//---------------------------------------
// Menu features 
async function get_menu_item(item_id){
  return await connPool.awaitQuery("SELECT * FROM menu WHERE itemId=?;", [item_id])
}
async function add_item_to_cart(item_id, userId,item_name,price){
  await connPool.awaitQuery('INSERT INTO cart (itemId,userId,item_name,price, total) VALUES(?,?,?,?,?);',[item_id, userId,item_name,price,price]);
  
}

async function is_item_in_cart(item_id){
  const result = await connPool.awaitQuery('SELECT * FROM cart WHERE itemId=?;',[item_id]);
  if(result.length > 0){
    return true;
  }
  return false;
}

async function get_cart(userId){
  return await connPool.awaitQuery("SELECT * FROM cart WHERE userId=?;", [userId]);
}

async function update_cart(cartId,quantity, total){
  const result = await connPool.awaitQuery('UPDATE cart SET quantity =?, total=? WHERE cartId =?;',[quantity,total,cartId]);
  if(result.length>0){
    return true;
  }
  return false;
}

async function delete_cart(cartId){
  const result = await connPool.awaitQuery('DELETE FROM cart WHERE cartId =?;',[cartId]);
  if(result.length>0){
    return true;
  }
  return false;
}
async function delete_all_cart(userId){
  await connPool.awaitQuery('DELETE FROM cart WHERE userId=?;', [userId]);
}
async function find_userName(userId){
  const result = await connPool.awaitQuery('SELECT user_name FROM user_auth WHERE userId=?;',[userId]);
  return result;
}

//-------------------------------------------

//-------------------------------------------
// Review features

async function getPost(){
  const result = await connPool.awaitQuery('SELECT post.postId, post.userId, post.content, post.like_icon, user_auth.user_name FROM post JOIN user_auth ON post.userId = user_auth.userId;');
  return result;
}
async function get_recent_post(){
  const result = await connPool.awaitQuery('SELECT post.postId, post.userId, post.content, post.like_icon, user_auth.user_name FROM post JOIN user_auth ON post.userId = user_auth.userId ORDER BY postId DESC LIMIT 5;');
  return result;
}
async function add_post(userId, content){
  try{
    await connPool.awaitQuery('INSERT INTO post (userId,content) VALUES (?,?);',[userId, content]);
  }catch (error) {
    console.error("Error");
  }
  
}
async function update_post(editedPost, postId){
  await connPool.awaitQuery('UPDATE post SET content =? WHERE postId =?;',[editedPost,postId]);
}
async function update_like(postId, is_vote){
  if(is_vote){
    await connPool.awaitQuery('UPDATE post SET like_icon=like_icon+1 WHERE postId=?;',[postId]);
  }
  else{
    await connPool.awaitQuery('UPDATE post SET like_icon=like_icon-1 WHERE postId=?;',[postId]);
  }
}
async function get_lastest_post(){
  return connPool.awaitQuery('SELECT LAST_INSERT_ID() as id from post limit 1;');
}
async function delete_post(postId){
  await connPool.awaitQuery('DELETE FROM post WHERE postId=?;', [postId]);
}

async function add_interaction_log(postId,userId){
  const result = await connPool.awaitQuery('INSERT INTO interaction_log(postId, userId) VALUES (?,?);',[postId,userId]);
  if(result.length > 0){
    return true;
  }
  return false;
  
 
}
async function get_interaction_log(postId,userId){
  return await connPool.awaitQuery('SELECT * FROM interaction_log WHERE userId=? AND postId=?;',[userId, postId]);
}

async function get_user_interaction_log(userId){
  return await connPool.awaitQuery('SELECT * FROM interaction_log WHERE userId=? ;',[userId]);
}

async function update_like_interaction_log(postId, userId){
  await connPool.awaitQuery('UPDATE interaction_log SET user_liked=? WHERE postId=? and userId=?;',[new Date(),postId, userId]);
  await connPool.awaitQuery('UPDATE interaction_log SET user_unliked=? WHERE postId=? and userId=?;',[null,postId, userId]);
}
async function update_unlike_interaction_log(postId, userId){
  await connPool.awaitQuery('UPDATE interaction_log SET user_unliked=? WHERE postId=? and userId=?;',[new Date(),postId, userId]);
  await connPool.awaitQuery('UPDATE interaction_log SET user_liked=? WHERE postId=? and userId=?;',[null,postId, userId]);
}

module.exports = {matchUser, is_userName_exist,addNewAccount, find_userId, user_login, user_logout
                  ,update_like, getPost, find_userName, add_post, update_post
                  ,delete_post,add_interaction_log,get_interaction_log
                  ,get_recent_post, get_menu_item,add_item_to_cart,get_cart,is_item_in_cart
                  ,update_cart, delete_cart,delete_all_cart, get_user_interaction_log
                  ,update_like_interaction_log,update_unlike_interaction_log, get_User
                  ,get_userId, get_lastest_post}
  