import { db, collection, getDocs, addDoc, deleteDoc, doc } from '../firebase/db.js';

export let clients = [];

export async function loadClients() {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    clients = [];
    const clientsList = document.getElementById('clientsList');
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

export async function loadClientSelect() {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    clients = [];
    const clientSelect = document.getElementById('clientSelect');
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

export async function saveClient() {
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

export async function deleteClient(id) {
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