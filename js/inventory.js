// js/inventory.js

function openInventory() {
    document.getElementById('inventory-modal').style.display = 'flex';
    closeMenu();
}

function closeInventory() {
    document.getElementById('inventory-modal').style.display = 'none';
}
