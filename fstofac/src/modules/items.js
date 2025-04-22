import { db, collection, getDocs, addDoc, deleteDoc, doc } from '../firebase/db.js';

export let items = [];

export async function loadItems() {
    const querySnapshot = await getDocs(collection(db, 'items'));
    items = [];
    const itemsList = document.getElementById('itemsList');
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

export async function loadItemSelect() {
    const querySnapshot = await getDocs(collection(db, 'items'));
    items = [];
    
    querySnapshot.forEach(doc => {
        const item = { id: doc.id, ...doc.data() };
        items.push(item);
    });
}

export async function saveItem() {
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

export async function deleteItem(id) {
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