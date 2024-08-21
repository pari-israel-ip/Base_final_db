// Configuración personal de Firebase
firebase.initializeApp({
    apiKey: "AIzaSyANZcRm-sIyIe26Z9jKOIwEzJFs8lRwqks",
    authDomain: "dblunes.firebaseapp.com",
    projectId: "dblunes"
});

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

// ...

// Función para agregar pedido
// ...

// Función para agregar pedido
function agregarPedido() {
    var userID = document.getElementById('userID').value;
    var fecha = document.getElementById('fecha').value;
    var producto = document.getElementById('producto').value;
    var cantidad = document.getElementById('cantidad').value;

    // Obtener el precio del producto seleccionado
    db.collection("products").where("name", "==", producto).get()
    .then(function(querySnapshot) {
        if (querySnapshot.docs.length > 0) {
            var precioProducto = querySnapshot.docs[0].data().price;

            // Calcular el total
            //esta actualizado
            var total = parseFloat(precioProducto) * parseInt(cantidad);

            // Asumiendo que ya tienes una función para agregar pedidos
            db.collection("orders").add({
                userID: userID,
                date: fecha
            })
            .then(function(orderDocRef) {
                // Agregar un documento a la subcolección 'products'
                db.collection("orders").doc(orderDocRef.id).collection("products").add({
                    name: producto,
                    quantity: parseInt(cantidad),
                    total: total
                })
                .then(function(productDocRef) {
                    console.log("Pedido y producto agregados con IDs:", orderDocRef.id, productDocRef.id);

                    // Limpiar los campos del formulario después de agregar el pedido
                    document.getElementById('userID').value = '';
                    document.getElementById('fecha').value = '';
                    document.getElementById('producto').value = '';
                    document.getElementById('cantidad').value = '';

                    // Actualizar la tabla con la información más reciente
                    actualizarTablaPedidos();

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
        } else {
            // Opcional: Mostrar mensaje de error si no se encuentra el producto
            alert("Producto no encontrado");
        }
    })
    .catch(function(error) {
        console.error("Error al obtener precio del producto: ", error);
        // Opcional: Mostrar mensaje de error al usuario
        alert("Error al obtener precio del producto");
    });
}

// ...
// ...
// Función para actualizar la tabla de pedidos
function actualizarTablaPedidos() {
    var tablaPedidos = document.getElementById('tablaPedidos');
    // Limpiamos las filas existentes
    tablaPedidos.innerHTML = '';

    // Obtenemos la lista de pedidos
    db.collection("orders").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(orderDoc) {
            var orderData = orderDoc.data();

            // Por cada pedido, obtenemos la lista de productos
            db.collection("orders").doc(orderDoc.id).collection("products").get().then(function(productsQuerySnapshot) {
                productsQuerySnapshot.forEach(function(productDoc) {
                    var productData = productDoc.data();

                    // Creamos una nueva fila en la tabla con los datos del pedido y producto
                    var newRow = tablaPedidos.insertRow(-1);

                    // Insertamos las celdas con los datos
                    newRow.insertCell(0).textContent = orderDoc.id; // ID Pedido
                    newRow.insertCell(1).textContent = ''; // Nombre Usuario (vacío por ahora)
                    newRow.insertCell(2).textContent = orderData.date; // Fecha
                    newRow.insertCell(3).textContent = productData.name; // Producto
                    newRow.insertCell(4).textContent = ''; // Precio Unidad (vacío por ahora)
                    newRow.insertCell(5).textContent = productData.quantity; // Cantidad
                    newRow.insertCell(6).textContent = productData.total; // Total

                    // Ahora, obtenemos el nombre del usuario y el precio del producto y actualizamos las celdas correspondientes
                    db.collection("users").doc(orderData.userID).get().then(function(userDoc) {
                        newRow.cells[1].textContent = userDoc.data().name; // Actualizamos el Nombre Usuario
                    });

                    db.collection("products").where("name", "==", productData.name).get().then(function(productQuerySnapshot) {
                        if (productQuerySnapshot.docs.length > 0) {
                            var precioProducto = productQuerySnapshot.docs[0].data().price;
                            newRow.cells[4].textContent = precioProducto; // Actualizamos el Precio Unidad
                        }
                    });

                    // Añadir botón Eliminar
                    var deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Eliminar';
                    deleteButton.className = 'btn btn-danger'; // Cambiar a 'btn btn-danger' para color rojo
                    deleteButton.addEventListener('click', function() {
                        eliminarPedido(orderDoc.id, productDoc.id);
                    });
                    newRow.insertCell(7).appendChild(deleteButton);

                    // Añadir botón Editar
                    var editButton = document.createElement('button');
editButton.textContent = 'Editar';
editButton.className = 'btn btn-warning'; 

editButton.addEventListener('click', function() {
    // Lógica para la edición (puedes implementar un modal o una página de edición)
    // Puedes usar orderDoc.id y productDoc.id para identificar el pedido y el producto específico
    // Aquí deberías abrir el formulario de edición y llenar los campos con los datos actuales
    document.getElementById('userID').value = orderData.userID;
    document.getElementById('fecha').value = orderData.date;
    document.getElementById('producto').value = productData.name;
    document.getElementById('cantidad').value = productData.quantity;

    // Cambiar la función del botón de "Guardar Cambios" para que actualice en lugar de agregar
    var guardarCambiosButton = document.getElementById('guardarCambiosButton');
    guardarCambiosButton.style.display = 'block';
    guardarCambiosButton.onclick = function() {
        // Lógica para la actualización del pedido
        actualizarPedido(orderDoc.id, productDoc.id);
    };
                    });
                    newRow.insertCell(8).appendChild(editButton);
                });
            });
        });
    });
}

// Función para eliminar un pedido y un producto específico
function eliminarPedido(orderID, productID) {
    // Eliminar el producto de la subcolección 'products'
    db.collection("orders").doc(orderID).collection("products").doc(productID).delete().then(function() {
        console.log("Producto eliminado con éxito!");

        // Actualizar la tabla después de eliminar el producto
        actualizarTablaPedidos();
    }).catch(function(error) {
        console.error("Error al eliminar el producto: ", error);
        // Opcional: Mostrar mensaje de error al usuario
        alert("Error al eliminar el producto");
    });
}// Función para actualizar un pedido y un producto específico
// Función para actualizar un pedido y un producto específico
function actualizarPedido(orderID, productID) {
    var userID = document.getElementById('userID').value;
    var fecha = document.getElementById('fecha').value;
    var producto = document.getElementById('producto').value;
    var cantidad = document.getElementById('cantidad').value;

    // Obtener el precio del producto seleccionado
    db.collection("products").where("name", "==", producto).get()
        .then(function(querySnapshot) {
            if (querySnapshot.docs.length > 0) {
                var precioProducto = querySnapshot.docs[0].data().price;

                // Calcular el total
                var total = parseFloat(precioProducto) * parseInt(cantidad);

                // Actualizar el pedido y el producto en la base de datos
                return db.collection("orders").doc(orderID).update({
                    userID: userID,
                    date: fecha
                })
                .then(function() {
                    // Actualizar el producto en la subcolección 'products'
                    return db.collection("orders").doc(orderID).collection("products").doc(productID).update({
                        name: producto,
                        quantity: parseInt(cantidad),
                        total: total
                    });
                });
            } else {
                alert("Producto no encontrado");
                throw new Error("Producto no encontrado");
            }
        })
        .then(function() {
            console.log("Pedido actualizado con éxito!");

            // Restablecer el formulario y los botones después de la actualización
            document.getElementById('userID').value = '';
            document.getElementById('fecha').value = '';
            document.getElementById('producto').value = '';
            document.getElementById('cantidad').value = '';
            var guardarCambiosButton = document.getElementById('guardarCambiosButton');
            guardarCambiosButton.style.display = 'none';

            // Actualizar la tabla después de la actualización del pedido
            actualizarTablaPedidos();

            // Opcional: Mostrar mensaje de éxito al usuario
            alert("Pedido actualizado exitosamente!");
        })
        .catch(function(error) {
            console.error("Error al actualizar pedido o producto: ", error);
            // Opcional: Mostrar mensaje de error al usuario
            alert("Error al actualizar pedido o producto");
        });
}

// Llamamos a esta función al cargar la página para llenar la tabla inicialmente
actualizarTablaPedidos();













































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

        // Llamamos a la función para cargar la lista de usuarios en el formulario de pedidos
        cargarUsuariosEnFormulario();
    })
    .catch(function(error) {
        console.error("Error al agregar usuario: ", error);
        // Opcional: Mostrar mensaje de error al usuario
        alert("Error al agregar usuario");
    });
}

// Función para cargar la lista de usuarios en el formulario de pedidos
function cargarUsuariosEnFormulario() {
    var selectUsuario = document.getElementById('userID');
    // Limpiamos las opciones existentes
    selectUsuario.innerHTML = '<option value="" disabled selected>Selecciona un usuario</option>';

    // Obtenemos la lista de usuarios y la agregamos al select
    db.collection("users").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var option = document.createElement('option');
            option.value = doc.id;
            option.text = doc.data().name;
            selectUsuario.add(option);
        });
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

        // Llamamos a la función para cargar la lista de productos en el formulario de pedidos
        cargarProductosEnFormulario();
    })
    .catch(function(error) {
        console.error("Error al agregar producto: ", error);
        // Opcional: Mostrar mensaje de error al usuario
        alert("Error al agregar producto");
    });
}

// Función para cargar la lista de productos en el formulario de pedidos
function cargarProductosEnFormulario() {
    var selectProducto = document.getElementById('producto');
    // Limpiamos las opciones existentes
    selectProducto.innerHTML = '<option value="" disabled selected>Selecciona un producto</option>';

    // Obtenemos la lista de productos y la agregamos al select
    db.collection("products").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var option = document.createElement('option');
            option.value = doc.data().name;
            option.text = doc.data().name;  // Usamos el nombre como texto de la opción
            selectProducto.add(option);
        });
    });
}

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

        // Llamamos a la función para cargar la lista de usuarios en el formulario de pedidos
        cargarUsuariosEnFormulario();
    })
    .catch(function(error) {
        console.error("Error al agregar usuario: ", error);
        // Opcional: Mostrar mensaje de error al usuario
        alert("Error al agregar usuario");
    });
}

// Función para cargar la lista de usuarios en el formulario de pedidos
function cargarUsuariosEnFormulario() {
    var selectUsuario = document.getElementById('userID');
    // Limpiamos las opciones existentes
    selectUsuario.innerHTML = '<option value="" disabled selected>Selecciona un usuario</option>';

    // Obtenemos la lista de usuarios y la agregamos al select
    db.collection("users").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var option = document.createElement('option');
            option.value = doc.id;
            option.text = doc.data().name;
            selectUsuario.add(option);
        });
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

        // Llamamos a la función para cargar la lista de productos en el formulario de pedidos
        cargarProductosEnFormulario();
    })
    .catch(function(error) {
        console.error("Error al agregar producto: ", error);
        // Opcional: Mostrar mensaje de error al usuario
        alert("Error al agregar producto");
    });
}

// Función para cargar la lista de productos en el formulario de pedidos
function cargarProductosEnFormulario() {
    var selectProducto = document.getElementById('producto');
    // Limpiamos las opciones existentes
    selectProducto.innerHTML = '<option value="" disabled selected>Selecciona un producto</option>';

    // Obtenemos la lista de productos y la agregamos al select
    db.collection("products").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var option = document.createElement('option');
            option.value = doc.data().name;
            option.text = doc.data().name;  // Usamos el nombre como texto de la opción
            selectProducto.add(option);
        });
    });
}

// ...