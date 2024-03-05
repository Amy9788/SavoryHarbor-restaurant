
async function qty(cartId, price){
  const get_qty = document.getElementById(`get-qty-num${cartId}`);
  const display = document.getElementById(`display-total${cartId}`);
  const display_quantity = document.getElementById(`display-quantity${cartId}`);
  let parse_qty = parseInt(get_qty.value);
  let parse_price = parseFloat(price);
  let total = -1;
  if(parse_qty && parse_price && parse_qty > 0){
    total = parse_qty * parse_price;
    display.innerText = total;
    display_quantity.innerText = parse_qty;
    try{
      await fetch("/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({cartId,parse_qty,total}),
      });
  
    } catch (error) {
      console.error("Error");
    }
  }
}

async function delete_item(cartId){
  const delete_data = document.querySelectorAll(`.data${cartId}`);
  delete_data.forEach(element => {
    element.remove();
  });
  try{
    await fetch("/cart/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({cartId}),
    });

  } catch (error) {
    console.error("Error");
  }

}

async function check_out(){
  alert("Thank you for your purchase!");
  try{
    const check_out = true;
    await fetch("/cart/check_out", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({check_out}),
    });

  } catch (error) {
    console.error("Error");
  }
  location.reload();
}
