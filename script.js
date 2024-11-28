const sheetID = '1z6JirAtCx9_gVNNUMXfDnvaVhcY55ZZuYh5Du0IOfe0';
const apiKey = 'AIzaSyACyo3-x-Fr2DHfHxRypRFPGzPjOIz3sIc';
const sheetURL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/lista?key=${apiKey}`;

let cart = []; // Carrito de productos

fetch(sheetURL)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener datos de Google Sheets');
        }
        return response.json();
    })
    .then(data => {
        const rows = data.values;
        const headers = rows[0].map(header => header.trim().toLowerCase());
        const products = rows.slice(1).map(row => {
            let product = {};
            headers.forEach((header, index) => {
                product[header] = row[index] || '';
            });
            return product;
        }).filter(product => product['active'] === 'Y');

        displayProducts(products);
    })
    .catch(error => console.error('Error al cargar productos:', error));

// Función para mostrar productos en la página
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    let currentCategory = ''; // Para rastrear y mostrar la categoría actual
    let categories = new Set(); // Para almacenar categorías únicas

    // URL de imagen por defecto
const defaultImageUrl = "./assets/no-image.avif"

products.forEach(product => {
    const category = product['product category'];

    // Agregar la categoría a la lista de categorías
    categories.add(category);

    // Verificar si se debe agregar el título de categoría
    if (category !== currentCategory) {
        currentCategory = category;
        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category;
        categoryTitle.id = category.replace(/\s+/g, '-').toLowerCase(); // Asignar ID a la categoría
        productList.appendChild(categoryTitle);
    }

    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    
    // Verificar si la imagen está disponible; si no, usar la imagen por defecto
    const imageUrl = product['image'] || defaultImageUrl;

    productDiv.innerHTML = `
        <img src="${imageUrl}" alt="${product['product name']}" style="max-width: 100px; cursor: pointer;" onclick="showImage('${imageUrl}')">
        <div class="product-info">
            <h3>${product['product name']}</h3>
            <p>${product['product description']}</p>
            <p>Precio: $${parseFloat(product['price']).toFixed(2)}</p>
            <label>
                Cantidad:
                <input type="number" min="1" value="1" data-name="${product['product name']}" data-price="${product['price']}">
            </label>
            <button class="add-to-cart" data-name="${product['product name']}" data-price="${product['price']}">Agregar al Carrito</button>
        </div>
    `;

    productList.appendChild(productDiv);
});


    // Agregar categorías a la barra de categorías
    const categoryList = document.getElementById('category-list');
    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => scrollToCategory(category)); // Mover a la categoría al hacer clic
        categoryList.appendChild(li);
    });

    // Agregar eventos a los botones de agregar al carrito
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Función para desplazarse a la categoría
function scrollToCategory(category) {
    const categoryId = category.replace(/\s+/g, '-').toLowerCase(); // Convertir a ID
    const categoryElement = document.getElementById(categoryId);
    if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: 'smooth' });
    }
}

// Función para mostrar la imagen en grande
function showImage(imageUrl) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.border = '5px solid white';
    modal.appendChild(img);

    modal.addEventListener('click', () => {
        modal.remove(); // Elimina el modal al hacer clic
    });

    document.body.appendChild(modal);
}


// Función para agregar productos al carrito
function addToCart(event) {
    const button = event.target;
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));

    const productContainer = button.closest('.product');
    const quantityInput = productContainer.querySelector('input[type="number"]');
    const quantity = parseInt(quantityInput.value, 10);
    const imageUrl = productContainer.querySelector('img').src; // Obtiene la URL de la imagen

    if (isNaN(quantity) || quantity <= 0) {
        alert("Por favor, ingresa una cantidad válida.");
        return;
    }

    const productInCart = cart.find(item => item.name === name);
    if (productInCart) {
        productInCart.quantity += quantity;
    } else {
        cart.push({ name, price, quantity, imageUrl }); // Agrega imageUrl al producto en el carrito
    }

    displayCart();
}


function displayCart() {
    const preview = document.getElementById('preview');
   
    
    let total = 0; // Variable para almacenar el total del pedido
    
    preview.innerHTML = cart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal; // Sumar el subtotal al total general

        return `
            <div class="product-cart" style="border-bottom: 1px solid #ccc; padding: 5px; display: flex; align-items: center;
            background-color:#ffa41c6;">
                <img src="${item.imageUrl}" alt="${item.name}" style="max-width: 50px; margin-right: 10px;">
                <div style="background-color:#ffa41c6">
                    ${item.name} - Cantidad: ${item.quantity} - Precio: $${item.price}
                    <p>Subtotal: $${subtotal.toFixed(2)}</p>
                </div>
                <button onclick="removeFromCart('${item.name}')">Eliminar</button>
            </div> 
        `;
    }).join('');

    // Agregar el total al final del carrito
    preview.innerHTML +=
    `
        <div style="padding-top: 10px; font-weight: bold;">
            Total del pedido: $${total.toFixed(2)}
        </div>
    `;

    document.getElementById('send-order').style.display = cart.length > 0 ? 'block' : 'none';
}



// Función para eliminar productos del carrito
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    displayCart();
}

document.getElementById('send-order').addEventListener('click', () => {
    if (cart.length === 0) {
        alert("No hay productos en el carrito.");
        return;
    }

    // Captura de los datos de input-group
    const name = document.querySelector('.input-group-item input[placeholder="Your name"]').value;
    const contactNumber = document.querySelector('.input-group-item input[placeholder="Enter contact number"]').value;
    const additionalInfo = document.querySelector('.input-group-item textarea').value;

    // Construcción del mensaje del carrito
    const cartMessage = cart.map(item => 
        `${item.name} - Cantidad: ${item.quantity} - Precio: $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    // Agregar la información de contacto al mensaje
    const message = `Nombre: ${name}\nNúmero de contacto: ${contactNumber}\nInformación adicional: ${additionalInfo}\n\nPedido:\n${cartMessage}`;

    const whatsappURL = `https://wa.me/3416154511?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
});

