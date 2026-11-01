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