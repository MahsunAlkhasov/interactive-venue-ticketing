// 1. VENUE DATA MODEL
const venueData = {
    name: "Grand Theatre",
    zones: [
        {
            id: "vip",
            name: "VIP Zone (Front)",
            price: 120,
            rows: [
                { rowLabel: "A", seatsCount: 8 },
                { rowLabel: "B", seatsCount: 8 }
            ]
        },
        {
            id: "standard",
            name: "Standard Orchestra",
            price: 75,
            rows: [
                { rowLabel: "C", seatsCount: 10 },
                { rowLabel: "D", seatsCount: 10 },
                { rowLabel: "E", seatsCount: 10 }
            ]
        },
        {
            id: "balcony",
            name: "Balcony",
            price: 45,
            rows: [
                { rowLabel: "F", seatsCount: 12 },
                { rowLabel: "G", seatsCount: 12 }
            ]
        }
    ],
    // Pre-configured list of unavailable seat IDs (simulating already booked seats)
    unavailableSeatIds: ["A3", "C5", "C6", "G1", "G2"]
};

// 2. DOM ELEMENTS
const venueContainer = document.getElementById("venue-container");

// 3. RENDER VENUE FROM DATA
function renderVenue() {
    venueContainer.innerHTML = ""; // Clear existing content

    venueData.zones.forEach(zone => {
        const zoneBlock = document.createElement("div");
        zoneBlock.className = "zone-block";

        const zoneTitle = document.createElement("div");
        zoneTitle.className = "zone-title";
        zoneTitle.textContent = `${zone.name} - $${zone.price}`;
        zoneBlock.appendChild(zoneTitle);

        zone.rows.forEach(row => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "seat-row";

            for (let i = 1; i <= row.seatsCount; i++) {
                const seatId = `${row.rowLabel}${i}`;
                const isUnavailable = venueData.unavailableSeatIds.includes(seatId);

                const seatBtn = document.createElement("button");
                seatBtn.className = `seat-btn ${isUnavailable ? 'unavailable' : 'available'}`;
                seatBtn.textContent = seatId;
                seatBtn.dataset.seatId = seatId;
                seatBtn.dataset.zoneName = zone.name;
                seatBtn.dataset.price = zone.price;
                seatBtn.dataset.status = isUnavailable ? 'unavailable' : 'available';

                if (isUnavailable) {
                    seatBtn.disabled = true;
                }
                // Seat Click Event listener
                seatBtn.addEventListener("click", () => handleSeatClick(seatBtn));
                rowDiv.appendChild(seatBtn);
            }
            zoneBlock.appendChild(rowDiv);
        });

        venueContainer.appendChild(zoneBlock);
    });
}

// Initial Render Call
document.addEventListener("DOMContentLoaded", () => {
    renderVenue();
});

// STATE MANAGEMENT
let currentlyInspectedSeat = null;

// ADDITIONAL DOM ELEMENTS
const inspectionDetails = document.getElementById("inspection-details");
const btnAddToCart = document.getElementById("btn-add-to-cart");

// INSPECTION LOGIC
function handleSeatClick(seatBtn) {
    const status = seatBtn.dataset.status;

    // Do nothing if seat is unavailable or already in cart
    if (status === 'unavailable' || status === 'in-cart') return;

    // Reset previously inspected seat if any
    if (currentlyInspectedSeat && currentlyInspectedSeat !== seatBtn) {
        if (currentlyInspectedSeat.dataset.status === 'inspected') {
            currentlyInspectedSeat.classList.remove('inspected');
            currentlyInspectedSeat.classList.add('available');
            currentlyInspectedSeat.dataset.status = 'available';
        }
    }

    // Toggle/Set new inspected seat
    seatBtn.classList.remove('available');
    seatBtn.classList.add('inspected');
    seatBtn.dataset.status = 'inspected';
    currentlyInspectedSeat = seatBtn;

    // Display inspection details
    const seatId = seatBtn.dataset.seatId;
    const zoneName = seatBtn.dataset.zoneName;
    const price = seatBtn.dataset.price;

    inspectionDetails.innerHTML = `
    <p><strong>Seat:</strong> ${seatId}</p>
    <p><strong>Section:</strong> ${zoneName}</p>
    <p><strong>Price:</strong> $${price}</p>
  `;

    btnAddToCart.disabled = false;
}
// 7. CART STATE
let cart = JSON.parse(localStorage.getItem('venue_cart')) || [];

// CART DOM ELEMENTS
const cartList = document.getElementById("cart-list");
const cartTotalDisplay = document.getElementById("cart-total");

// ADD TO CART BUTTON CLICK HANDLER
btnAddToCart.addEventListener("click", () => {
    if (!currentlyInspectedSeat) return;

    const seatId = currentlyInspectedSeat.dataset.seatId;
    const zoneName = currentlyInspectedSeat.dataset.zoneName;
    const price = parseFloat(currentlyInspectedSeat.dataset.price);

    // Prevent adding duplicate seats
    const exists = cart.some(item => item.id === seatId);
    if (exists) return;

    // Add seat object to cart state
    cart.push({ id: seatId, zone: zoneName, price: price });

    // Update map seat status to in-cart
    currentlyInspectedSeat.classList.remove('inspected');
    currentlyInspectedSeat.classList.add('in-cart');
    currentlyInspectedSeat.dataset.status = 'in-cart';
    currentlyInspectedSeat = null;

    // Reset Inspection Panel
    inspectionDetails.innerHTML = `<p class="placeholder-text">Click on any available seat to view details and price.</p>`;
    btnAddToCart.disabled = true;

    updateCartUI();
    saveCartToStorage();
});

// REMOVE FROM CART ACTION
function removeFromCart(seatId) {
    cart = cart.filter(item => item.id !== seatId);

    // Sync map: find matching seat button on map and restore state to available
    const seatBtn = document.querySelector(`.seat-btn[data-seat-id="${seatId}"]`);
    if (seatBtn) {
        seatBtn.classList.remove('in-cart');
        seatBtn.classList.add('available');
        seatBtn.dataset.status = 'available';
    }

    updateCartUI();
    saveCartToStorage();
}

// UPDATE CART UI & CALCULATE TOTAL
function updateCartUI() {
    cartList.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price;
        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
      <span><strong>${item.id}</strong> (${item.zone}) - $${item.price}</span>
      <button class="btn-remove" onclick="removeFromCart('${item.id}')">✕</button>
    `;
        cartList.appendChild(li);
    });

    cartTotalDisplay.textContent = `$${total.toFixed(2)}`;
}

// SAVE TO LOCALSTORAGE
function saveCartToStorage() {
    localStorage.setItem('venue_cart', JSON.stringify(cart));
}

// RESTORE MAP & CART STATE ON REFRESH
function restoreCartState() {
    cart.forEach(item => {
        const seatBtn = document.querySelector(`.seat-btn[data-seat-id="${item.id}"]`);
        if (seatBtn) {
            seatBtn.classList.remove('available');
            seatBtn.classList.add('in-cart');
            seatBtn.dataset.status = 'in-cart';
        }
    });
    updateCartUI();
}

// UPDATE INITIALIZATION TO RESTORE SAVED CART
document.addEventListener("DOMContentLoaded", () => {
    renderVenue();
    restoreCartState();
});

// 8. MAP PAN & ZOOM NAVIGATION
let scale = 1;
let translateX = 0;
let translateY = 0;

const mapCanvas = document.getElementById("map-canvas");
const STEP = 30;
const ZOOM_STEP = 0.15;

function updateTransform() {
    mapCanvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

document.getElementById("btn-zoom-in").addEventListener("click", () => {
    scale = Math.min(scale + ZOOM_STEP, 2.0);
    updateTransform();
});

document.getElementById("btn-zoom-out").addEventListener("click", () => {
    scale = Math.max(scale - ZOOM_STEP, 0.6);
    updateTransform();
});

document.getElementById("btn-move-up").addEventListener("click", () => {
    translateY += STEP;
    updateTransform();
});

document.getElementById("btn-move-down").addEventListener("click", () => {
    translateY -= STEP;
    updateTransform();
});

document.getElementById("btn-move-left").addEventListener("click", () => {
    translateX += STEP;
    updateTransform();
});

document.getElementById("btn-move-right").addEventListener("click", () => {
    translateX -= STEP;
    updateTransform();
});

document.getElementById("btn-reset").addEventListener("click", () => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
});