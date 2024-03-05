// Code adapted from https://www.w3schools.com/howto/howto_js_toggle_password.asp
function showPassword(){
  const input = document.getElementById("password");
  if(input.type === "password"){
    input.type = "text";
  }else{
    input.type = "password";
  }
}


