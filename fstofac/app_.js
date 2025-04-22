import { initializeApp } from "https://www.gstatic.com/firebasejs/9.7.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    where, 
    addDoc, 
    doc, 
    setDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.7.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDSl5uJ607YcuDsgCjh2v8Q2VE9L77hXXY",
    authDomain: "punctobill.firebaseapp.com",
    projectId: "punctobill",
    storageBucket: "punctobill.appspot.com",
    messagingSenderId: "55340577315",
    appId: "1:55340577315:web:96cc9e848a89cb716b7796",
    measurementId: "G-N1CW12BCJ9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elementos del DOM
const filterBtn = document.getElementById('filterBtn');
const docTypeFilter = document.getElementById('docTypeFilter');
const clientNameFilter = document.getElementById('clientNameFilter');
const sellerNameFilter = document.getElementById('sellerNameFilter');
const documentsList = document.getElementById('documentsList');

// Elementos para nuevo documento
const newDocType = document.getElementById('newDocType');
const docDate = document.getElementById('docDate');
const clientSelect = document.getElementById('clientSelect');
const sellerSelect = document.getElementById('sellerSelect');
const itemsContainer = document.getElementById('itemsContainer');
const totalAmount = document.getElementById('totalAmount');
const saveDocumentBtn = document.getElementById('saveDocumentBtn');

// Elementos para gestionar datos
const itemsList = document.getElementById('itemsList');
const clientsList = document.getElementById('clientsList');
const sellersList = document.getElementById('sellersList');

// Elementos de modales
const saveItemBtn = document.getElementById('saveItemBtn');
const saveClientBtn = document.getElementById('saveClientBtn');
const saveSellerBtn = document.getElementById('saveSellerBtn');

// Variables globales
let items = [];
let clients = [];
let sellers = [];
let nextDocNumber = 1;

// Funciones auxiliares
function openTab(tabName) {
    // Ocultar todos los contenidos de pestañas
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Desactivar todas las pestañas
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    // Mostrar la pestaña seleccionada
    document.getElementById(tabName).classList.add('active');
    
    // Activar el botón de la pestaña
    const tabButtons = document.getElementsByClassName('tab');
    for (let i = 0; i < tabButtons.length; i++) {
        if (tabButtons[i].textContent.includes(tabName.replace('documents', 'Documentos').replace('newDocument', 'Nuevo Documento').replace('manageData', 'Gestionar Datos'))) {
            tabButtons[i].classList.add('active');
        }
    }
    
    // Si es la pestaña de gestión de datos, cargar los datos
    if (tabName === 'manageData') {
        loadItems();
        loadClients();
        loadSellers();
    }
    
    // Si es la pestaña de nuevo documento, cargar selects
    if (tabName === 'newDocument') {
        loadClientSelect();
        loadSellerSelect();
        loadItemSelect();
        // Establecer fecha actual por defecto
        const today = new Date().toISOString().split('T')[0];
        docDate.value = today;
    }
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Limpiar formularios
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

function calculateTotal() {
    let total = 0;
    const itemRows = itemsContainer.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const vat = parseFloat(row.querySelector('.item-vat').value) || 0;
        
        const subtotal = quantity * price;
        const totalWithVat = subtotal * (1 + vat / 100);
        
        total += totalWithVat;
    });
    
    totalAmount.textContent = total.toFixed(2);
}

function addItemRow(item = null) {
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
        <button class="btn-danger" onclick="this.parentElement.remove(); calculateTotal();">X</button>
    `;
    
    itemsContainer.appendChild(row);
    
    // Configurar eventos
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
    
    // Si es un artículo existente, cargar datos
    if (item) {
        price.value = item.price;
        vat.value = item.vat;
    }
    
    calculateTotal();
}

// Funciones para cargar datos
async function loadItems() {
    const querySnapshot = await getDocs(collection(db, 'items'));
    items = [];
    itemsList.innerHTML = '';
    
    querySnapshot.forEach(doc => {
        const item = { id: doc.id, ...doc.data() };
        items.push(item);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.price} €</td>
            <td>${item.vat} %</td>
            <td>
                <button class="btn-danger" onclick="deleteItem('${doc.id}')">Eliminar</button>
            </td>
        `;
        itemsList.appendChild(tr);
    });
}

async function loadClients() {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    clients = [];
    clientsList.innerHTML = '';
    
    querySnapshot.forEach(doc => {
        const client = { id: doc.id, ...doc.data() };
        clients.push(client);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${client.name}</td>
            <td>${client.address || ''}</td>
            <td>${client.phone || ''}</td>
            <td>${client.email || ''}</td>
            <td>
                <button class="btn-danger" onclick="deleteClient('${doc.id}')">Eliminar</button>
            </td>
        `;
        clientsList.appendChild(tr);
    });
}

async function loadSellers() {
    const querySnapshot = await getDocs(collection(db, 'sellers'));
    sellers = [];
    sellersList.innerHTML = '';
    
    querySnapshot.forEach(doc => {
        const seller = { id: doc.id, ...doc.data() };
        sellers.push(seller);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${seller.name}</td>
            <td>${seller.email || ''}</td>
            <td>${seller.phone || ''}</td>
            <td>
                <button class="btn-danger" onclick="deleteSeller('${doc.id}')">Eliminar</button>
            </td>
        `;
        sellersList.appendChild(tr);
    });
}

async function loadClientSelect() {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    clients = [];
    clientSelect.innerHTML = '<option value="">Seleccionar cliente existente</option>';
    
    querySnapshot.forEach(doc => {
        const client = { id: doc.id, ...doc.data() };
        clients.push(client);
        
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = client.name;
        clientSelect.appendChild(option);
    });
}

async function loadSellerSelect() {
    const querySnapshot = await getDocs(collection(db, 'sellers'));
    sellers = [];
    sellerSelect.innerHTML = '<option value="">Seleccionar vendedor existente</option>';
    
    querySnapshot.forEach(doc => {
        const seller = { id: doc.id, ...doc.data() };
        sellers.push(seller);
        
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = seller.name;
        sellerSelect.appendChild(option);
    });
}

async function loadItemSelect() {
    const querySnapshot = await getDocs(collection(db, 'items'));
    items = [];
    
    querySnapshot.forEach(doc => {
        const item = { id: doc.id, ...doc.data() };
        items.push(item);
    });
}

async function getNextDocumentNumber(docType) {
    // En una aplicación real, podrías querer implementar una secuencia numérica más robusta
    const q = query(collection(db, docType), where('number', '>=', 0));
    const querySnapshot = await getDocs(q);
    let maxNumber = 0;
    
    querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.number > maxNumber) {
            maxNumber = data.number;
        }
    });
    
    return maxNumber + 1;
}

// Funciones para guardar datos
async function saveItem() {
    const name = document.getElementById('itemName').value.trim();
    const price = parseFloat(document.getElementById('itemPrice').value);
    const vat = parseFloat(document.getElementById('itemVat').value);
    
    if (!name || isNaN(price)) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
    }
    
    try {
        await addDoc(collection(db, 'items'), {
            name,
            price,
            vat
        });
        
        alert('Artículo guardado correctamente.');
        closeModal('newItemModal');
        loadItems();
        loadItemSelect();
    } catch (error) {
        console.error('Error al guardar el artículo:', error);
        alert('Error al guardar el artículo.');
    }
}

async function saveClient() {
    const name = document.getElementById('clientName').value.trim();
    const address = document.getElementById('clientAddress').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const cif = document.getElementById('clientCif').value.trim();
    
    if (!name) {
        alert('Por favor, complete el nombre del cliente.');
        return;
    }
    
    try {
        await addDoc(collection(db, 'customers'), {
            name,
            address: address || null,
            phone: phone || null,
            email: email || null,
            cif: cif || null
        });
        
        alert('Cliente guardado correctamente.');
        closeModal('newClientModal');
        loadClients();
        loadClientSelect();
    } catch (error) {
        console.error('Error al guardar el cliente:', error);
        alert('Error al guardar el cliente.');
    }
}

async function saveSeller() {
    const name = document.getElementById('sellerName').value.trim();
    const email = document.getElementById('sellerEmail').value.trim();
    const phone = document.getElementById('sellerPhone').value.trim();
    const cif = document.getElementById('sellerCif').value.trim();
    
    if (!name) {
        alert('Por favor, complete el nombre del vendedor.');
        return;
    }
    
    try {
        await addDoc(collection(db, 'sellers'), {
            name,
            email: email || null,
            phone: phone || null,
            cif: cif || null
        });
        
        alert('Vendedor guardado correctamente.');
        closeModal('newSellerModal');
        loadSellers();
        loadSellerSelect();
    } catch (error) {
        console.error('Error al guardar el vendedor:', error);
        alert('Error al guardar el vendedor.');
    }
}

async function saveDocument() {
    const docType = newDocType.value;
    const date = docDate.value;
    const clientId = clientSelect.value;
    const sellerId = sellerSelect.value;
    
    // Validaciones
    if (!date) {
        alert('Por favor, seleccione una fecha.');
        return;
    }
    
    if (!clientId) {
        alert('Por favor, seleccione un cliente.');
        return;
    }
    
    if (!sellerId) {
        alert('Por favor, seleccione un vendedor.');
        return;
    }
    
    const itemRows = itemsContainer.querySelectorAll('.item-row');
    if (itemRows.length === 0) {
        alert('Por favor, añada al menos un artículo.');
        return;
    }
    
    // Obtener datos del cliente y vendedor
    const client = clients.find(c => c.id === clientId);
    const seller = sellers.find(s => s.id === sellerId);
    
    if (!client || !seller) {
        alert('Error al obtener datos del cliente o vendedor.');
        return;
    }
    
    // Preparar artículos
    const documentItems = [];
    let isValid = true;
    
    itemRows.forEach(row => {
        const select = row.querySelector('.item-select');
        const quantity = parseFloat(row.querySelector('.item-quantity').value);
        const price = parseFloat(row.querySelector('.item-price').value);
        const vat = parseFloat(row.querySelector('.item-vat').value);
        
        if (!select.value || isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) {
            isValid = false;
            return;
        }
        
        const selectedItem = items.find(i => i.id === select.value);
        
        documentItems.push({
            id: selectedItem.id,
            name: selectedItem.name,
            quantity,
            price,
            vat,
            total: quantity * price * (1 + vat / 100)
        });
    });
    
    if (!isValid) {
        alert('Por favor, revise los artículos. Todos deben tener una cantidad válida.');
        return;
    }
    
    // Calcular total
    const total = documentItems.reduce((sum, item) => sum + item.total, 0);
    
    try {
        // Obtener número de documento
        const number = await getNextDocumentNumber(docType);
        
        // Crear documento
        await addDoc(collection(db, docType), {
            number,
            date: new Date(date),
            client: {
                id: client.id,
                name: client.name,
                address: client.address,
                phone: client.phone,
                email: client.email,
                cif: client.cif
            },
            seller: {
                id: seller.id,
                name: seller.name,
                email: seller.email,
                phone: seller.phone,
                cif: seller.cif
            },
            items: documentItems,
            subtotal: documentItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            tax: documentItems.reduce((sum, item) => sum + (item.price * item.quantity * item.vat / 100), 0),
            total,
            createdAt: serverTimestamp()
        });
        
        alert('Documento guardado correctamente.');
        
        // Limpiar formulario
        itemsContainer.innerHTML = '';
        totalAmount.textContent = '0.00';
        
        // Volver a la pestaña de documentos
        openTab('documents');
        getDocuments(docType);
    } catch (error) {
        console.error('Error al guardar el documento:', error);
        alert('Error al guardar el documento.');
    }
}

// Funciones para eliminar datos
async function deleteItem(id) {
    if (confirm('¿Está seguro de que desea eliminar este artículo?')) {
        try {
            await deleteDoc(doc(db, 'items', id));
            alert('Artículo eliminado correctamente.');
            loadItems();
            loadItemSelect();
        } catch (error) {
            console.error('Error al eliminar el artículo:', error);
            alert('Error al eliminar el artículo.');
        }
    }
}

async function deleteClient(id) {
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
        try {
            await deleteDoc(doc(db, 'customers', id));
            alert('Cliente eliminado correctamente.');
            loadClients();
            loadClientSelect();
        } catch (error) {
            console.error('Error al eliminar el cliente:', error);
            alert('Error al eliminar el cliente.');
        }
    }
}

async function deleteSeller(id) {
    if (confirm('¿Está seguro de que desea eliminar este vendedor?')) {
        try {
            await deleteDoc(doc(db, 'sellers', id));
            alert('Vendedor eliminado correctamente.');
            loadSellers();
            loadSellerSelect();
        } catch (error) {
            console.error('Error al eliminar el vendedor:', error);
            alert('Error al eliminar el vendedor.');
        }
    }
}

// Función para obtener documentos filtrados
const getDocuments = async (docType = '', clientName = '', sellerName = '') => {
    let q = query(collection(db, docType || 'invoices'));  // Default a 'invoices' si no se selecciona tipo

    if (clientName) {
        q = query(q, where('client.name', '>=', clientName), where('client.name', '<=', clientName + '\uf8ff'));
    }

    if (sellerName) {
        q = query(q, where('seller.name', '>=', sellerName), where('seller.name', '<=', sellerName + '\uf8ff'));
    }

    const querySnapshot = await getDocs(q);
    documentsList.innerHTML = ''; // Limpiar lista antes de mostrar los resultados

    querySnapshot.forEach(doc => {
        const data = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${data.number}</td>
            <td>${docType === 'invoices' ? 'Factura' : 'Presupuesto'}</td>
            <td>${data.client.name}</td>
            <td>${data.seller.name}</td>
            <td>${data.total.toFixed(2)} €</td>
            <td>${data.date.toDate().toLocaleDateString()}</td>
        `;
        documentsList.appendChild(tr);
    });
};

// Event Listeners
window.onload = () => {
    // Cargar documentos al inicio
    getDocuments('invoices');
    
    // Configurar eventos de botones
    filterBtn.addEventListener('click', () => {
        const docType = docTypeFilter.value;
        const clientName = clientNameFilter.value.trim();
        const sellerName = sellerNameFilter.value.trim();

        getDocuments(docType, clientName, sellerName);
    });
    
    saveItemBtn.addEventListener('click', saveItem);
    saveClientBtn.addEventListener('click', saveClient);
    saveSellerBtn.addEventListener('click', saveSeller);
    saveDocumentBtn.addEventListener('click', saveDocument);
    
    // Permitir el uso de la tecla Enter en los filtros
    clientNameFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filterBtn.click();
        }
    });
    
    sellerNameFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filterBtn.click();
        }
    });
};

// Hacer funciones accesibles globalmente
window.openTab = openTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.addItemRow = addItemRow;
window.calculateTotal = calculateTotal;
window.deleteItem = deleteItem;
window.deleteClient = deleteClient;
window.deleteSeller = deleteSeller;