export function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    
    const tabButtons = document.getElementsByClassName('tab');
    for (let i = 0; i < tabButtons.length; i++) {
        if (tabButtons[i].textContent.includes(tabName.replace('documents', 'Documentos').replace('newDocument', 'Nuevo Documento').replace('manageData', 'Gestionar Datos'))) {
            tabButtons[i].classList.add('active');
        }
    }
}

export function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

export function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    if (modalId === 'newItemModal') {
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
        document.getElementById('itemVat').value = '21';
    } else if (modalId === 'newClientModal') {
        document.getElementById('clientName').value = '';
        document.getElementById('clientAddress').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('clientEmail').value = '';
    } else if (modalId === 'newSellerModal') {
        document.getElementById('sellerName').value = '';
        document.getElementById('sellerEmail').value = '';
        document.getElementById('sellerPhone').value = '';
    }
}

export function calculateTotal() {
    let total = 0;
    const itemsContainer = document.getElementById('itemsContainer');
    const itemRows = itemsContainer.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const vat = parseFloat(row.querySelector('.item-vat').value) || 0;
        
        const subtotal = quantity * price;
        const totalWithVat = subtotal * (1 + vat / 100);
        
        total += totalWithVat;
    });
    
    document.getElementById('totalAmount').textContent = total.toFixed(2);
}

export function addItemRow(items, item = null) {
    const itemsContainer = document.getElementById('itemsContainer');
    const row = document.createElement('div');
    row.className = 'item-row';
    
    row.innerHTML = `
        <select class="item-select">
            <option value="">Seleccionar artículo</option>
            ${items.map(i => `<option value="${i.id}" data-price="${i.price}" data-vat="${i.vat}" ${item && item.id === i.id ? 'selected' : ''}>${i.name} (${i.price}€ + ${i.vat}% IVA)</option>`).join('')}
        </select>
        <input type="number" class="item-quantity" placeholder="Cantidad" min="1" value="${item ? item.quantity : '1'}">
        <input type="number" class="item-price" placeholder="Precio" step="0.01" value="${item ? item.price : ''}" readonly>
        <input type="number" class="item-vat" placeholder="IVA %" step="0.01" value="${item ? item.vat : ''}" readonly>
        <button class="btn-danger btn-del-item" onclick="this.parentElement.remove(); calculateTotal();"><i class= "fas fa-trash"></i></button>
    `;
    
    itemsContainer.appendChild(row);
    
    const select = row.querySelector('.item-select');
    const quantity = row.querySelector('.item-quantity');
    const price = row.querySelector('.item-price');
    const vat = row.querySelector('.item-vat');
    
    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            price.value = selectedOption.getAttribute('data-price');
            vat.value = selectedOption.getAttribute('data-vat');
        } else {
            price.value = '';
            vat.value = '';
        }
        calculateTotal();
    });
    
    quantity.addEventListener('input', calculateTotal);
    
    if (item) {
        price.value = item.price;
        vat.value = item.vat;
    }
    
    calculateTotal();
}