const MENU = [
    { id: "com-ga", name: "Cơm gà xối mỡ", cat: "com", icon: "bi-egg-fried", price: 38000, desc: "Đùi gà chiên giòn, cơm nóng, dưa leo và nước mắm chua ngọt." },
    { id: "com-suon", name: "Cơm sườn nướng", cat: "com", icon: "bi-fire", price: 42000, desc: "Sườn nướng mật ong, cơm tấm, trứng ốp la và đồ chua." },
    { id: "com-ca", name: "Cơm cá kho tộ", cat: "com", icon: "bi-droplet", price: 40000, desc: "Cá kho tộ đậm đà ăn kèm canh rau và cơm trắng." },
    { id: "pho-bo", name: "Phở bò tái", cat: "mi", icon: "bi-cup-hot", price: 45000, desc: "Nước dùng ninh xương 8 tiếng, bò tái mềm, rau thơm tươi." },
    { id: "mi-quang", name: "Mì Quảng gà", cat: "mi", icon: "bi-egg", price: 40000, desc: "Mì tươi, gà ta xé, nước lèo sánh đậm vị miền Trung." },
    { id: "bun-cha", name: "Bún chả Hà Nội", cat: "mi", icon: "bi-fire", price: 45000, desc: "Chả nướng than hoa, bún tươi, nước chấm chua ngọt." },
    { id: "nem-ran", name: "Nem rán", cat: "an-vat", icon: "bi-basket3", price: 25000, desc: "Nem rán giòn nhân thịt, mộc nhĩ, cà rốt, ăn kèm rau sống." },
    { id: "banh-cuon", name: "Bánh cuốn nóng", cat: "an-vat", icon: "bi-circle", price: 28000, desc: "Bánh cuốn tráng mỏng, nhân thịt băm, hành phi thơm." },
    { id: "goi-cuon", name: "Gỏi cuốn tôm thịt", cat: "an-vat", icon: "bi-flower1", price: 30000, desc: "Cuốn tay với tôm, thịt luộc, bún và rau sống, chấm tương." },
    { id: "tra-dao", name: "Trà đào cam sả", cat: "do-uong", icon: "bi-cup-straw", price: 25000, desc: "Trà đào thanh mát kết hợp cam tươi và sả." },
    { id: "sinh-to", name: "Sinh tố bơ", cat: "do-uong", icon: "bi-cup", price: 28000, desc: "Bơ sáp xay sánh mịn cùng sữa đặc béo ngậy." },
    { id: "nuoc-mia", name: "Nước mía", cat: "do-uong", icon: "bi-droplet-half", price: 15000, desc: "Nước mía nguyên chất ép tươi tại chỗ, mát lạnh." },
];

const SIZES = [
    { key: "vua", label: "Vừa", delta: 0 },
    { key: "lon", label: "Lớn", delta: 10000 },
];

const SHIPPING_FEE = 15000;

let cart = [];
let currentItem = null;
let currentSize = SIZES[0];
let currentQty = 1;

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

function renderMenu(filter = "all") {
    const grid = document.getElementById("menuGrid");
    grid.innerHTML = "";
    MENU.filter((m) => filter === "all" || m.cat === filter).forEach((item) => {
        const col = document.createElement("div");
        col.className = "col-6 col-md-4 col-lg-3";
        col.innerHTML = `
      <div class="menu-card" data-id="${item.id}" role="button" tabindex="0">
        <div class="menu-card-media"><i class="bi ${item.icon}"></i></div>
        <div class="menu-card-body">
          <p class="menu-card-name">${item.name}</p>
          <p class="menu-card-desc">${item.desc}</p>
          <div class="menu-card-footer">
            <span class="menu-card-price">${fmt(item.price)}</span>
            <button class="menu-card-add" aria-label="Thêm ${item.name}"><i class="bi bi-plus-lg"></i></button>
          </div>
        </div>
      </div>`;
        grid.appendChild(col);
    });
    grid.querySelectorAll(".menu-card").forEach((card) => {
        card.addEventListener("click", () => openItemModal(card.dataset.id));
        card.addEventListener("keypress", (e) => {
            if (e.key === "Enter") openItemModal(card.dataset.id);
        });
    });
}

document.getElementById("categoryBar").addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-btn");
    if (!btn) return;
    document.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderMenu(btn.dataset.cat);
});

function openItemModal(id) {
    currentItem = MENU.find((m) => m.id === id);
    currentSize = SIZES[0];
    currentQty = 1;

    document.getElementById("modalIcon").className = `bi ${currentItem.icon}`;
    document.getElementById("modalName").textContent = currentItem.name;
    document.getElementById("modalDesc").textContent = currentItem.desc;
    document.getElementById("qtyValue").textContent = "1";

    const sizeGroup = document.getElementById("sizeGroup");
    sizeGroup.innerHTML = "";
    SIZES.forEach((size) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn" + (size.key === currentSize.key ? " active-size" : "");
        btn.textContent = size.delta ? `${size.label} +${fmt(size.delta)}` : size.label;
        btn.addEventListener("click", () => {
            currentSize = size;
            sizeGroup.querySelectorAll(".btn").forEach((b) => b.classList.remove("active-size"));
            btn.classList.add("active-size");
            updateModalPrice();
        });
        sizeGroup.appendChild(btn);
    });

    updateModalPrice();
    new bootstrap.Modal(document.getElementById("itemModal")).show();
}

function updateModalPrice() {
    const unit = currentItem.price + currentSize.delta;
    document.getElementById("modalPrice").textContent = fmt(unit * currentQty);
}

document.getElementById("qtyMinus").addEventListener("click", () => {
    if (currentQty > 1) currentQty--;
    document.getElementById("qtyValue").textContent = currentQty;
    updateModalPrice();
});
document.getElementById("qtyPlus").addEventListener("click", () => {
    currentQty++;
    document.getElementById("qtyValue").textContent = currentQty;
    updateModalPrice();
});

document.getElementById("addToCartBtn").addEventListener("click", () => {
    const lineId = `${currentItem.id}-${currentSize.key}`;
    const existing = cart.find((l) => l.lineId === lineId);
    const unitPrice = currentItem.price + currentSize.delta;
    if (existing) {
        existing.qty += currentQty;
    } else {
        cart.push({
            lineId,
            id: currentItem.id,
            name: currentItem.name,
            icon: currentItem.icon,
            size: currentSize.label,
            unitPrice,
            qty: currentQty,
        });
    }
    renderCart();
    bootstrap.Modal.getInstance(document.getElementById("itemModal")).hide();
});

function renderCart() {
    const container = document.getElementById("cartItems");
    const empty = document.getElementById("cartEmpty");
    container.innerHTML = "";

    if (cart.length === 0) {
        empty.style.display = "block";
    } else {
        empty.style.display = "none";
        cart.forEach((line) => {
            const row = document.createElement("div");
            row.className = "cart-line";
            row.innerHTML = `
        <div class="cart-line-icon"><i class="bi ${line.icon}"></i></div>
        <div class="flex-grow-1">
          <p class="cart-line-name">${line.name}</p>
          <p class="cart-line-meta">Size ${line.size}</p>
          <div class="cart-line-qty">
            <button aria-label="Giảm số lượng" data-action="minus">−</button>
            <span>${line.qty}</span>
            <button aria-label="Tăng số lượng" data-action="plus">+</button>
          </div>
        </div>
        <div class="text-end">
          <p class="cart-line-price">${fmt(line.unitPrice * line.qty)}</p>
          <button class="cart-line-remove" aria-label="Xoá món"><i class="bi bi-trash"></i></button>
        </div>`;
            row.querySelector('[data-action="minus"]').addEventListener("click", () => changeQty(line.lineId, -1));
            row.querySelector('[data-action="plus"]').addEventListener("click", () => changeQty(line.lineId, 1));
            row.querySelector(".cart-line-remove").addEventListener("click", () => removeLine(line.lineId));
            container.appendChild(row);
        });
    }

    const subtotal = cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
    const total = cart.length ? subtotal + SHIPPING_FEE : 0;
    const count = cart.reduce((sum, l) => sum + l.qty, 0);

    document.getElementById("cartCount").textContent = count;
    document.getElementById("cartSubtotal").textContent = fmt(subtotal);
    document.getElementById("cartTotal").textContent = fmt(total);
    document.getElementById("checkoutTotal").textContent = fmt(total);
    document.getElementById("checkoutBtn").disabled = cart.length === 0;
}

function changeQty(lineId, delta) {
    const line = cart.find((l) => l.lineId === lineId);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) {
        cart = cart.filter((l) => l.lineId !== lineId);
    }
    renderCart();
}

function removeLine(lineId) {
    cart = cart.filter((l) => l.lineId !== lineId);
    renderCart();
}

document.getElementById("checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }
    bootstrap.Modal.getInstance(document.getElementById("checkoutModal")).hide();
    cart = [];
    renderCart();
    form.reset();
    form.classList.remove("was-validated");
    new bootstrap.Modal(document.getElementById("successModal")).show();
});

renderMenu();
renderCart();