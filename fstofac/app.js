import { db } from './src/firebase/db.js';
import { getDocuments, getNextDocumentNumber, saveDocument } from './src/modules/documents.js';
import { items, loadItems, loadItemSelect, saveItem, deleteItem } from './src/modules/items.js';
import { clients, loadClients, loadClientSelect, saveClient, deleteClient } from './src/modules/clients.js';
import { sellers, loadSellers, loadSellerSelect, saveSeller, deleteSeller } from './src/modules/sellers.js';
import { openTab, openModal, closeModal, calculateTotal, addItemRow } from './src/modules/ui.js';

// Configurar funciones globales
window.openTab = openTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.addItemRow = () => addItemRow(items);
window.calculateTotal = calculateTotal;
window.deleteItem = deleteItem;
window.deleteClient = deleteClient;
window.deleteSeller = deleteSeller;

// Función para cargar todos los datos iniciales
async function loadAllData() {
    try {
        // Mostrar algún indicador de carga si es necesario
        console.log("Cargando datos iniciales...");
        
        // Cargar todos los datos en paralelo para mayor eficiencia
        await Promise.all([
            loadItems(),
            loadClients(),
            loadSellers(),
            getDocuments('invoices')
        ]);
        
        // Cargar los selects para el formulario de nuevo documento
        await Promise.all([
            loadItemSelect(),
            loadClientSelect(),
            loadSellerSelect()
        ]);
        
        console.log("Todos los datos cargados correctamente");
        
        // Establecer fecha actual por defecto en el formulario de nuevo documento
        const today = new Date().toISOString().split('T')[0];
        const docDateInput = document.getElementById('docDate');
        if (docDateInput) {
            docDateInput.value = today;
        }
        
    } catch (error) {
        console.error("Error al cargar los datos iniciales:", error);
        alert("Error al cargar los datos iniciales. Por favor, recarga la página.");
    }
}

// Event Listeners
window.onload = async () => {
    // Cargar todos los datos al inicio
    await loadAllData();
    
    // Configurar eventos de botones
    document.getElementById('filterBtn').addEventListener('click', () => {
        const docType = document.getElementById('docTypeFilter').value;
        const clientName = document.getElementById('clientNameFilter').value.trim();
        const sellerName = document.getElementById('sellerNameFilter').value.trim();

        getDocuments(docType, clientName, sellerName);
    });
    
    document.getElementById('saveItemBtn').addEventListener('click', saveItem);
    document.getElementById('saveClientBtn').addEventListener('click', saveClient);
    document.getElementById('saveSellerBtn').addEventListener('click', saveSeller);
    document.getElementById('saveDocumentBtn').addEventListener('click', () => saveDocument(items, clients, sellers));
    
    // Permitir el uso de la tecla Enter en los filtros
    document.getElementById('clientNameFilter').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('filterBtn').click();
        }
    });
    
    document.getElementById('sellerNameFilter').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('filterBtn').click();
        }
    });
    
    // Configurar evento para el botón de añadir artículo
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => addItemRow(items));
    }
};