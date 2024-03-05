create table user (
  userId INT AUTO_INCREMENT not null,
  full_name TEXT not null,
  email TEXT not null,
  PRIMARY KEY (userId)
);

create table user_auth (
  userId INT,
  user_name VARCHAR(255) not null,
  user_password_hash TEXT not null,
  FOREIGN KEY (userId) REFERENCES user(userId),
  PRIMARY KEY (user_name)
);

CREATE TABLE logIn (
  logIn_id INT AUTO_INCREMENT not null,
  userId INT,
  user_name VARCHAR(255) not null,
  user_login TIMESTAMP,
  user_logout TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(userId),
  FOREIGN KEY (user_name) REFERENCES user_auth(user_name),
  PRIMARY KEY (logIn_id)
);

-- 
CREATE TABLE menu (
  itemId INT AUTO_INCREMENT NOT NULL,
  item_name TEXT NOT NULL,
  price FLOAT NOT NULL,
  PRIMARY KEY (itemId)
);
-- Insert to the menu
INSERT INTO menu (item_name,price) VALUEs ('Cozy Miso Ramen', 12.99);
INSERT INTO menu (item_name,price) VALUEs ('Seafood Mix', 18.99);
INSERT INTO menu (item_name,price) VALUEs ('Spicy Ramen', 14.99);
INSERT INTO menu (item_name,price) VALUEs ('Java-Infused Salmon', 16.99 );
INSERT INTO menu (item_name,price) VALUEs ('Margherita Pizza', 10.99);
INSERT INTO menu (item_name,price) VALUEs ('Bread Pudding Love', 8.99);
INSERT INTO menu (item_name,price) VALUEs ('Fruit Medley Parfait', 7.99);
INSERT INTO menu (item_name,price) VALUEs ('Crafted Coffee Delights', 3.99 );
INSERT INTO menu (item_name,price) VALUEs ('Signature Cold Brew', 4.99);
INSERT INTO menu (item_name,price) VALUEs ('Gourmet Hot Chocolate', 4.49);

CREATE TABLE cart(
  cartId INT AUTO_INCREMENT NOT NULL,
  itemId INT,
  userId INT,
  item_name text not null, 
  price float not null,
  total float not null DEFAULT 0,
  quantity INT DEFAULT 1, 
  FOREIGN KEY (itemId) REFERENCES menu(itemId),
  FOREIGN KEY (userId) REFERENCES user(userId),
  PRIMARY KEY (cartId)
);

-- 

CREATE TABLE post(
  postId INT AUTO_INCREMENT NOT NULL,
  userId INT,
  content text not null,
  like_icon INT DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES user(userId),
  PRIMARY KEY (postId)
);

CREATE TABLE interaction_log(
  interaction_log_id INT AUTO_INCREMENT NOT NULL,
  postId INT,
  userId INT,
  user_liked TIMESTAMP,
  user_unliked TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES post(postId),
  FOREIGN KEY (userId) REFERENCES user(userId),
  PRIMARY KEY (interaction_log_id),
  UNIQUE KEY (postId, userId)
);
-- 
