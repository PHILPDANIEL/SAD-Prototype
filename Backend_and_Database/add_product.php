<?php
$conn = new mysqli("localhost","root","","sayotea_pos");

if($conn->connect_error){
    die("Connection failed: " . $conn->connect_error);
}

// Get data from form
$id = $_POST['id'];
$name = $_POST['name'];
$category = $_POST['category'];
$price = $_POST['price'];
$stock = $_POST['stock'];

// Insert into DB
$sql = "INSERT INTO products (name, category, price, stock)
        VALUES ('$name','$category','$price','$stock')";

if($conn->query($sql) === TRUE){
    echo "Product added successfully";
}else{
    echo "Error: " . $conn->error;
}

$conn->close();
?>