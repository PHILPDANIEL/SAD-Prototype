<?php
$conn = new mysqli("localhost", "root", "", "sayotea_pos");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM products";
$result = $conn->query($sql);

// Start the table

echo "<table class='product-table'>";
echo "<tr>
        <th>ID</th>
        <th>Name</th>
        <th>Category</th>
        <th>Price</th>
        <th>Stock</th>
         <th>image</th>
        <th>Actions</th>
      </tr>";

// Loop through each product
while ($row = $result->fetch_assoc()) {
    echo "<tr>
            <td>".$row['id']."</td>
            <td>".$row['name']."</td>
            <td>".$row['category']."</td>
            <td>₱".$row['price']."</td>
            <td>".$row['stock']."</td>
            <td>".$row['image']."</td>
            <td>
                <button class='edit-btn' onclick='editProduct(".$row['id'].")'>Edit</button>
                <button class='delete-btn' onclick='deleteProduct(".$row['id'].")'>Delete</button>
            </td>
          </tr>";
}

echo "</table>";

$conn->close();
?>