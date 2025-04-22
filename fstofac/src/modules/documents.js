import { 
    db, 
    collection, 
    getDocs, 
    query, 
    where, 
    addDoc, 
    serverTimestamp 
} from '../firebase/db.js';
import { calculateTotal } from './ui.js';
import { sendInvoiceByEmail } from '../emailjs/emailjs.js';

let nextDocNumber = 1;

export async function getNextDocumentNumber(docType) {
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

export async function getDocuments(docType = '', clientName = '', sellerName = '') {
    let q = query(collection(db, docType || 'invoices'));

    if (clientName) {
        q = query(q, where('client.name', '>=', clientName), where('client.name', '<=', clientName + '\uf8ff'));
    }

    if (sellerName) {
        q = query(q, where('seller.name', '>=', sellerName), where('seller.name', '<=', sellerName + '\uf8ff'));
    }

    const querySnapshot = await getDocs(q);
    const documentsList = document.getElementById('documentsList');
    documentsList.innerHTML = '';

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
}

export async function saveDocument(items, clients, sellers) {
    const docType = document.getElementById('newDocType').value;
    const date = document.getElementById('docDate').value;
    const clientId = document.getElementById('clientSelect').value;
    const sellerId = document.getElementById('sellerSelect').value;
    const itemsContainer = document.getElementById('itemsContainer');
    const shipmentPrice = parseFloat(document.getElementById('shipmentPrice').value);
    
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
    
    const client = clients.find(c => c.id === clientId);
    const seller = sellers.find(s => s.id === sellerId);
    
    if (!client || !seller) {
        alert('Error al obtener datos del cliente o vendedor.');
        return;
    }
    
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
    
    const total = shipmentPrice + documentItems.reduce((sum, item) => sum + item.total, 0);
    
    try {
        const number = await getNextDocumentNumber(docType);
        
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
        

        const emailData = {
            orderId: number,
            type: docType === 'invoices' ? 'Factura' : 'Presupuesto',
            invoiceDate: new Date(date).toLocaleDateString(),
          
            // Cliente
            clientName: client.name,
            clientEmail: client.email,
            clientAddress: client.address,
            clientPhone: client.phone,
            clientCIF: client.cif,
          
            // Vendedor
            sellerName: seller.name,
            sellerEmail: seller.email,
            sellerAddress: seller.address,
            sellerPhone: seller.phone,
            sellerCIF: seller.cif,
          
            // Costes
            cost: {
              subtotal: documentItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              shipping: shipmentPrice, // puedes ajustar este valor si lo manejas en tu UI
              tax: documentItems.reduce((sum, item) => sum + (item.price * item.quantity * item.vat / 100), 0),
              total: total
            },
          
            // Productos
            items: documentItems.map(item => ({
              description: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              total: item.total,
              image_url: item.image_url || 'https://via.placeholder.com/64'
            }))
          };
          
          try {
            await sendInvoiceByEmail(emailData);
            console.log('Correo enviado correctamente.');
          } catch (emailErr) {
            console.error('Error al enviar correo:', emailErr);
            alert('El documento se guardó, pero no se pudo enviar el correo.');
          }

        alert('Documento guardado correctamente.');
        
        itemsContainer.innerHTML = '';
        document.getElementById('totalAmount').textContent = '0.00';
        
        openTab('documents');
        getDocuments(docType);
    } catch (error) {
        console.error('Error al guardar el documento:', error);
        alert('Error al guardar el documento.');
    }
}