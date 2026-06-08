const products = [
    {
        id: 1,
        name: "Peperomia Ginny",
        price: 25,
        rating: 4.7,
        category: "Indoor",
        image: "assets/images/image 8.png"
    },
    {
        id: 2,
        name: "Bird's Nest Fern",
        price: 45,
        rating: 4.5,
        category: "Fern",
        image: "assets/images/image 9.png"
    },
    {
        id: 3,
        name: "Large Majesty Palm",
        price: 52,
        rating: 4.3,
        category: "Palm",
        image: "assets/images/image 10.png"
    },
    {
        id: 4,
        name: "Pet Friendly Plant",
        price: 30,
        rating: 4.8,
        category: "Plant",
        image: "assets/images/image 11.png"
    },
    {
        id: 5,
        name: "Calathea Orbifolia",
        price: 38,
        rating: 4.6,
        category: "Indoor",
        image: "assets/images/image 14.png"
    },
    {
        id: 6,
        name: "Pink Anthurium",
        price: 42,
        rating: 4.4,
        category: "Gift",
        image: "assets/images/image 15.png"
    },
    {
        id: 7,
        name: "Peace Lily",
        price: 34,
        rating: 4.2,
        category: "Flower",
        image: "assets/images/image 16.png"
    },
    {
        id: 8,
        name: "Croton Petra",
        price: 29,
        rating: 4.9,
        category: "Colorful",
        image: "assets/images/image 17.png"
    }
];

let isAllShown = false;
let openedProducts = products;
let cart = loadSaved("plantifyCart", []);
let liked = loadSaved("plantifyLiked", []);

function loadSaved(key, fallback) {
    const value = localStorage.getItem(key);

    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function saveShopState() {
    localStorage.setItem("plantifyCart", JSON.stringify(cart));
    localStorage.setItem("plantifyLiked", JSON.stringify(liked));
}

function makePrice(price) {
    return "$" + price;
}

function findProduct(productId) {
    return products.find(function (product) {
        return product.id === productId;
    });
}

function isLiked(productId) {
    return liked.includes(productId);
}

function cartItem(productId) {
    return cart.find(function (item) {
        return item.id === productId;
    });
}

function makeProductCard(product) {
    const likedClass = isLiked(product.id) ? " liked" : "";
    const inCartClass = cartItem(product.id) ? " in-cart" : "";

    return `
        <article class="product-card" data-product-id="${product.id}">
            <button class="like-btn${likedClass}" type="button" aria-label="Like ${product.name}" data-like-product="${product.id}"></button>

            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>

            <div class="product-info">
                <div class="product-top">
                    <h3>${product.name}</h3>
                    <span>${makePrice(product.price)}</span>
                </div>

                <div class="product-meta">
                    <span>${product.category}</span>
                    <span>Rating: ${product.rating}</span>
                </div>

                <div class="product-bottom">
                    <div class="colors" aria-hidden="true">
                        <span class="black"></span>
                        <span class="pink"></span>
                        <span class="beige"></span>
                        <span class="brown"></span>
                    </div>

                    <button class="buy-btn${inCartClass}" type="button" data-add-cart="${product.id}">${cartItem(product.id) ? "Added" : "Buy"}</button>
                </div>
            </div>
        </article>
    `;
}

function renderProducts(list) {
    const productPlace = document.querySelector("#products-list");
    const viewButton = document.querySelector("#featured-toggle");
    let showProducts = list;

    openedProducts = list;

    if (!isAllShown) {
        showProducts = list.slice(0, 4);
    }

    if (list.length === 0) {
        productPlace.innerHTML = '<div class="products-message empty">No products found.</div>';
    } else {
        productPlace.innerHTML = showProducts.map(makeProductCard).join("");
    }

    viewButton.hidden = list.length <= 4;
    viewButton.textContent = isAllShown ? "show less" : "view all";
    updateShopPanels();
}

function searchProducts() {
    const searchInput = document.querySelector("#product-search");
    const searchText = searchInput.value.toLowerCase().trim();

    isAllShown = false;

    const result = products.filter(function (product) {
        return product.name.toLowerCase().includes(searchText)
            || product.category.toLowerCase().includes(searchText);
    });

    renderProducts(result);
}

function addToCart(productId) {
    const item = cartItem(productId);

    if (item) {
        item.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveShopState();
    renderProducts(openedProducts);
    openPanel("cart");
}

function removeFromCart(productId) {
    cart = cart.filter(function (item) {
        return item.id !== productId;
    });

    saveShopState();
    renderProducts(openedProducts);
}

function toggleLike(productId) {
    if (isLiked(productId)) {
        liked = liked.filter(function (id) {
            return id !== productId;
        });
    } else {
        liked.push(productId);
    }

    saveShopState();
    renderProducts(openedProducts);
}

function makePanelItem(product, details, actionName, actionValue) {
    return `
        <div class="shop-panel-item">
            <img src="${product.image}" alt="${product.name}">
            <div>
                <h4>${product.name}</h4>
                <span>${details}</span>
            </div>
            <button type="button" data-${actionName}="${actionValue}" aria-label="Remove ${product.name}">x</button>
        </div>
    `;
}

function updateShopPanels() {
    const cartCount = document.querySelector("[data-cart-count]");
    const likesCount = document.querySelector("[data-likes-count]");
    const cartList = document.querySelector("[data-cart-list]");
    const likesList = document.querySelector("[data-likes-list]");
    const cartTotal = document.querySelector("[data-cart-total]");

    const cartQuantity = cart.reduce(function (total, item) {
        return total + item.quantity;
    }, 0);

    const totalPrice = cart.reduce(function (total, item) {
        const product = findProduct(item.id);
        return product ? total + product.price * item.quantity : total;
    }, 0);

    cartCount.textContent = cartQuantity;
    likesCount.textContent = liked.length;
    cartTotal.textContent = makePrice(totalPrice);

    if (cart.length === 0) {
        cartList.innerHTML = '<p class="shop-panel-empty">Your cart is empty.</p>';
    } else {
        cartList.innerHTML = cart.map(function (item) {
            const product = findProduct(item.id);
            return product ? makePanelItem(product, makePrice(product.price) + " x " + item.quantity, "remove-cart", product.id) : "";
        }).join("");
    }

    if (liked.length === 0) {
        likesList.innerHTML = '<p class="shop-panel-empty">No liked plants yet.</p>';
    } else {
        likesList.innerHTML = liked.map(function (productId) {
            const product = findProduct(productId);
            return product ? makePanelItem(product, makePrice(product.price), "remove-like", product.id) : "";
        }).join("");
    }
}

function openPanel(panelName) {
    const cartPanel = document.querySelector("[data-cart-panel]");
    const likesPanel = document.querySelector("[data-likes-panel]");

    cartPanel.classList.toggle("open", panelName === "cart");
    likesPanel.classList.toggle("open", panelName === "likes");
}

function closePanels() {
    document.querySelector("[data-cart-panel]").classList.remove("open");
    document.querySelector("[data-likes-panel]").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector("#product-search");
    const viewButton = document.querySelector("#featured-toggle");
    const productsList = document.querySelector("#products-list");

    renderProducts(products);

    searchInput.addEventListener("input", searchProducts);

    viewButton.addEventListener("click", function () {
        isAllShown = !isAllShown;
        renderProducts(openedProducts);
    });

    productsList.addEventListener("click", function (event) {
        const cartButton = event.target.closest("[data-add-cart]");
        const likeButton = event.target.closest("[data-like-product]");

        if (cartButton) {
            addToCart(Number(cartButton.dataset.addCart));
        }

        if (likeButton) {
            toggleLike(Number(likeButton.dataset.likeProduct));
        }
    });

    document.addEventListener("click", function (event) {
        const openCart = event.target.closest("[data-open-cart]");
        const openLikes = event.target.closest("[data-open-likes]");
        const closePanel = event.target.closest("[data-close-panel]");
        const addCart = event.target.closest("[data-add-cart]");
        const likeProduct = event.target.closest("[data-like-product]");
        const removeCart = event.target.closest("[data-remove-cart]");
        const removeLike = event.target.closest("[data-remove-like]");
        const shopPanel = event.target.closest(".shop-panel");

        if (openCart) {
            openPanel("cart");
        } else if (openLikes) {
            openPanel("likes");
        } else if (closePanel) {
            closePanels();
        } else if (addCart || likeProduct) {
            return;
        } else if (removeCart) {
            removeFromCart(Number(removeCart.dataset.removeCart));
        } else if (removeLike) {
            toggleLike(Number(removeLike.dataset.removeLike));
        } else if (!shopPanel) {
            closePanels();
        }
    });
});
