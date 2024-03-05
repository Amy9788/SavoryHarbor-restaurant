async function addOrder(item_id, message) {
  console.log(message);
  if(message){
    alert("Please log in to place your order");
  }
  else{ 
    try {
      const response = await fetch("/user/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_id}),
      });
      console.log(response.status);
      if (response.status == 201) {
        console.log("Order successfully added");
      }
    } catch (error) {
      console.error("Error");
    }

  }
  
}
