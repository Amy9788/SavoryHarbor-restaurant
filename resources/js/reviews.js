let is_like = {};
function mark_like_button(){
  const load_data = document.getElementById('get_user_interaction').getAttribute('data');
  var json = JSON.parse(load_data);
  if(is_like){
    for(const i in json){
      if(json[i].user_liked != null){
        const postId = json[i].postId;
        const like_btn = document.getElementById(`like_btn${postId}`);
        like_btn.style.backgroundColor = "#60A3D9";
        is_like[postId] = true;
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', mark_like_button);

async function getLike(postId, userId,user_permit){
  const likes = document.getElementById(`countlikes${postId}`);
  const announment = document.getElementById("announment");
  const like_btn = document.getElementById(`like_btn${postId}`);
  if(userId != user_permit && likes){
    let cur_likes = parseInt(likes.innerText);
    if (is_like[postId]) {
      cur_likes = Math.max(0, cur_likes - 1);
      delete is_like[postId];
      likes.innerText = cur_likes;  
      like_btn.style.backgroundColor = "#b0cbb0";
      console.log("remove_like: ", is_like);
      try {
        await fetch("/review/like", {
          method: "delete",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({postId}),
        });
           
      } catch (error) {
        console.error("Error");
      }
    }
    else{
      cur_likes +=1;
      is_like[postId] = true;
      likes.innerText = cur_likes;  
      like_btn.style.backgroundColor = "#60A3D9";
      try {
        await fetch("/review/like", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({postId}),
        });
        
      } catch (error) {
        console.error("Error");
      }
  }
    
  }
  else{
    like_btn.style.backgroundColor = "#b0cbb0";
    announment.innerText = "Sorry! you can't vote your own post";
    announment.style.backgroundColor = "#efe79d";
    setTimeout(function() {
      announment.innerText = "";
      announment.style.backgroundColor = "#ccb28f";
    }, 2000);
  }
}

// Code adapted from https://codepen.io/JoannaEl/pen/ZjaBvr
function edit(postId){
  const content = document.getElementById(`content${postId}`);
  if (content) {
    content.contentEditable = true;
    content.style.backgroundColor = "#E9DAC4";
  }
}

// Code adapted from https://codepen.io/JoannaEl/pen/ZjaBvr
async function done(postId, userId){
  const content = document.getElementById(`content${postId}`);
  let getContent = "";
  if (content) {
    content.contentEditable = false;
    content.style.backgroundColor = "#b0cbb0";
    getContent = content.innerText;
    if(getContent != ""){
      try{
        await fetch("/review/done", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({postId,userId,getContent}),
        });

      } catch (error) {
        console.error("Error");
      }
    }
  }
}

async function delete_post(postId, userId){
  const post = document.querySelectorAll(`.post${postId}`);
  post.forEach(element => {
    element.remove();
  });
  try{
    await fetch("/review/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({postId,userId}),
    });
  } catch (error) {
      console.error("Error");
  }
    
}

function back_btn(curr_page){
  const get_page = document.getElementById("page");
  const cur = (parseInt(curr_page, 10) - 1) || 1;
  get_page.innerText = "Page " + cur;
}

function forward_btn(curr_page){
  const get_page = document.getElementById("page");
  const cur = (parseInt(curr_page, 10) + 1) || 1;
  get_page.innerText = "Page " + cur;
}