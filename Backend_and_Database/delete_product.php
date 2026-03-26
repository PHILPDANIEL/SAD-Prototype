<?php
$conn = new mysqli("localhost","root","","sayotea_pos");

$id = $_GET['id'];
$sql = "DELETE FROM products WHERE id=$id";

if($conn->query($sql) === TRUE){
    echo "Product deleted successfully";
} else {
    echo "Error deleting product";
}

$conn->close();
?>