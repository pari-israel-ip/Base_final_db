// Configuración personal de Firebase
firebase.initializeApp({
    apiKey: "AIzaSyANZcRm-sIyIe26Z9jKOIwEzJFs8lRwqks",
    authDomain: "dblunes.firebaseapp.com",
    projectId: "dblunes"
});

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

// Función para agregar pedido
function agregarPedido() {
    var userID = document.getElementById('userID').value;
    var fecha = document.getElementById('fecha').value;
    var producto = document.getElementById('producto').value;
    var cantidad = document.getElementById('cantidad').value;

    // Asumiendo que ya tienes una función para agregar pedidos
    // La función debería crear un nuevo documento en la colección 'orders'
    // y dentro de ese documento, crear una subcolección 'products'
    db.collection("orders").add({
        userID: userID,
        date: fecha
    })
    .then(function(orderDocRef) {
        // Agregar un documento a la subcolección 'products'
        db.collection("orders").doc(orderDocRef.id).collection("products").add({
            name: producto,
            quantity: cantidad
            // También puedes agregar el precio si es relevante para tu caso
        })
        .then(function(productDocRef) {
            console.log("Pedido y producto agregados con IDs:", orderDocRef.id, productDocRef.id);

            // Limpiar los campos del formulario después de agregar el pedido
            document.getElementById('userID').value = '';
            document.getElementById('fecha').value = '';
            document.getElementById('producto').value = '';
            document.getElementById('cantidad').value = '';

            // Opcional: Mostrar mensaje de éxito al usuario
            alert("Pedido agregado exitosamente!");
        })
        .catch(function(error) {
            console.error("Error al agregar producto al pedido: ", error);
            // Opcional: Mostrar mensaje de error al usuario
            alert("Error al agregar producto al pedido");
        });
    })
    .catch(function(error) {
        console.error("Error al agregar pedido: ", error);
        // Opcional: Mostrar mensaje de error al usuario
        alert("Error al agregar pedido");
    });
}

// Otras funciones y código para leer, editar, eliminar, etc.
// Asegúrate de tener funciones para gestionar usuarios y productos también
// Función para agregar usuario
function agregarUsuario() {
    var nombreUsuario = document.getElementById('nombreUsuario').value;
    var emailUsuario = document.getElementById('emailUsuario').value;

    db.collection("users").add({
        name: nombreUsuario,
        email: emailUsuario
    })
    .then(function(docRef) {
        console.log("Usuario agregado con ID: ", docRef.id);
        // Limpiar los campos del formulario después de agregar el usuario
        document.getElementById('nombreUsuario').value = '';
        document.getElementById('emailUsuario').value = '';

        // Opcional: Mostrar mensaje de éxito al usuario
        alert("Usuario agregado exitosamente!");
    })
    .catch(function(error) {
        console.error("Error al agregar usuario: ", error);
        // Opcional: Mostrar mensaje de error al usuario
        alert("Error al agregar usuario");
    });
}

// Función para agregar producto
function agregarProducto() {
    var nombreProducto = document.getElementById('nombreProducto').value;
    var precioProducto = document.getElementById('precioProducto').value;

    db.collection("products").add({
        name: nombreProducto,
        price: precioProducto
    })
    .then(function(docRef) {
        console.log("Producto agregado con ID: ", docRef.id);
        // Limpiar los campos del formulario después de agregar el producto
        document.getElementById('nombreProducto').value = '';
        document.getElementById('precioProducto').value = '';

        // Opcional: Mostrar mensaje de éxito al usuario
        alert("Producto agregado exitosamente!");
    })
    .catch(function(error) {
        console.error("Error al agregar producto: ", error);
        // Opcional: Mostrar mensaje de error al usuario
        alert("Error al agregar producto");
    });
}
