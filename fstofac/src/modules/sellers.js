import { db, collection, getDocs, addDoc, deleteDoc, doc } from '../firebase/db.js';

export let sellers = [];

export async function loadSellers() {
    const querySnapshot = await getDocs(collection(db, 'sellers'));
    sellers = [];
    const sellersList = document.getElementById('sellersList');
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

export async function loadSellerSelect() {
    const querySnapshot = await getDocs(collection(db, 'sellers'));
    sellers = [];
    const sellerSelect = document.getElementById('sellerSelect');
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

export async function saveSeller() {
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

export async function deleteSeller(id) {
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