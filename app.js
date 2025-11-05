// Estado de la aplicación (en memoria)
let productos = [
  { nombre: "Producto A", codigo: "P001", precio: 50, stock: 20, stock_minimo: 5, ventas: 0 },
  { nombre: "Producto B", codigo: "P002", precio: 75, stock: 15, stock_minimo: 5, ventas: 0 },
  { nombre: "Producto C", codigo: "P003", precio: 100, stock: 8, stock_minimo: 5, ventas: 0 },
  { nombre: "Producto D", codigo: "P004", precio: 25, stock: 3, stock_minimo: 5, ventas: 0 }
];

let transacciones = [];
let saldoCaja = 1000;
let productoSeleccionadoModal = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  inicializarApp();
});

function inicializarApp() {
  configurarMenu();
  configurarNavegacion();
  configurarFormularios();
  actualizarDashboard();
  actualizarInventario();
  actualizarSelectProductos();
  actualizarCaja();
  actualizarReportes();
}

// Configuración del menú hamburguesa
function configurarMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  
  menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    navMenu.classList.toggle('active');
    
    // Crear o remover overlay
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'overlay';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function() {
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
      });
    }
    overlay.classList.toggle('active');
  });
}

// Configuración de navegación entre vistas
function configurarNavegacion() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const vista = this.getAttribute('data-view');
      cambiarVista(vista);
      
      // Cerrar menú móvil
      document.getElementById('navMenu').classList.remove('active');
      const overlay = document.querySelector('.overlay');
      if (overlay) overlay.classList.remove('active');
      
      // Actualizar navegación activa
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function cambiarVista(nombreVista) {
  // Ocultar todas las vistas
  const vistas = document.querySelectorAll('.view');
  vistas.forEach(vista => vista.classList.remove('active'));
  
  // Mostrar la vista seleccionada
  const vistaActual = document.getElementById(`view-${nombreVista}`);
  if (vistaActual) {
    vistaActual.classList.add('active');
  }
  
  // Actualizar datos según la vista
  if (nombreVista === 'dashboard') {
    actualizarDashboard();
  } else if (nombreVista === 'inventario') {
    actualizarInventario();
  } else if (nombreVista === 'ventas') {
    actualizarSelectProductos();
  } else if (nombreVista === 'caja') {
    actualizarCaja();
  } else if (nombreVista === 'reportes') {
    actualizarReportes();
  }
}

// Configuración de formularios
function configurarFormularios() {
  // Formulario de venta
  const formVenta = document.getElementById('formVenta');
  formVenta.addEventListener('submit', function(e) {
    e.preventDefault();
    registrarVenta();
  });
  
  // Selector de producto en ventas
  const selectProducto = document.getElementById('productoVenta');
  selectProducto.addEventListener('change', function() {
    mostrarInfoProducto();
  });
  
  // Campo de cantidad
  const cantidadInput = document.getElementById('cantidadVenta');
  cantidadInput.addEventListener('input', function() {
    calcularTotalVenta();
  });
  
  // Formulario agregar producto
  const formAgregar = document.getElementById('formAgregarProducto');
  formAgregar.addEventListener('submit', function(e) {
    e.preventDefault();
    agregarProducto();
  });
  
  // Formulario nueva transacción
  const formTransaccion = document.getElementById('formNuevaTransaccion');
  formTransaccion.addEventListener('submit', function(e) {
    e.preventDefault();
    guardarTransaccion();
  });
  
  // Búsqueda en inventario
  const searchInput = document.getElementById('searchInventario');
  searchInput.addEventListener('input', function() {
    filtrarInventario(this.value);
  });
}

// Dashboard
function actualizarDashboard() {
  // Total productos
  document.getElementById('totalProductos').textContent = productos.length;
  
  // Ventas del día
  const ventasHoy = calcularVentasDelDia();
  document.getElementById('ventasDelDia').textContent = formatearMoneda(ventasHoy);
  
  // Saldo caja
  document.getElementById('saldoCaja').textContent = formatearMoneda(saldoCaja);
  
  // Stock bajo
  const stockBajo = productos.filter(p => p.stock <= p.stock_minimo).length;
  document.getElementById('stockBajo').textContent = stockBajo;
}

function calcularVentasDelDia() {
  const hoy = new Date().toDateString();
  return transacciones
    .filter(t => t.tipo === 'venta' && new Date(t.fecha).toDateString() === hoy)
    .reduce((sum, t) => sum + t.monto, 0);
}

// Inventario
function actualizarInventario() {
  const lista = document.getElementById('listaProductos');
  lista.innerHTML = '';
  
  if (productos.length === 0) {
    lista.innerHTML = '<div class="empty-state">No hay productos en el inventario</div>';
    return;
  }
  
  productos.forEach(producto => {
    const card = crearProductoCard(producto);
    lista.appendChild(card);
  });
}

function crearProductoCard(producto) {
  const card = document.createElement('div');
  card.className = 'producto-card';
  if (producto.stock <= producto.stock_minimo) {
    card.classList.add('stock-bajo');
  }
  
  const stockClass = producto.stock <= producto.stock_minimo ? 'bajo' : 'ok';
  
  card.innerHTML = `
    <div class="producto-header">
      <div>
        <div class="producto-nombre">${producto.nombre}</div>
        <div class="producto-codigo">${producto.codigo}</div>
      </div>
      <span class="stock-badge ${stockClass}">${producto.stock} unid.</span>
    </div>
    <div class="producto-info-grid">
      <div class="producto-info-item">
        <span class="producto-info-label">Precio</span>
        <span class="producto-info-value">${formatearMoneda(producto.precio)}</span>
      </div>
      <div class="producto-info-item">
        <span class="producto-info-label">Vendidos</span>
        <span class="producto-info-value">${producto.ventas}</span>
      </div>
    </div>
  `;
  
  card.addEventListener('click', function() {
    mostrarDetalleProducto(producto);
  });
  
  return card;
}

function filtrarInventario(termino) {
  const terminoLower = termino.toLowerCase();
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(terminoLower) ||
    p.codigo.toLowerCase().includes(terminoLower)
  );
  
  const lista = document.getElementById('listaProductos');
  lista.innerHTML = '';
  
  if (productosFiltrados.length === 0) {
    lista.innerHTML = '<div class="empty-state">No se encontraron productos</div>';
    return;
  }
  
  productosFiltrados.forEach(producto => {
    const card = crearProductoCard(producto);
    lista.appendChild(card);
  });
}

function mostrarDetalleProducto(producto) {
  productoSeleccionadoModal = producto;
  const modal = document.getElementById('modalProducto');
  document.getElementById('productoModalTitulo').textContent = producto.nombre;
  
  const detalle = document.getElementById('productoModalDetalle');
  detalle.innerHTML = `
    <div class="info-row">
      <span class="info-label">Código:</span>
      <span class="info-value">${producto.codigo}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Precio:</span>
      <span class="info-value">${formatearMoneda(producto.precio)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Stock actual:</span>
      <span class="info-value">${producto.stock} unidades</span>
    </div>
    <div class="info-row">
      <span class="info-label">Stock mínimo:</span>
      <span class="info-value">${producto.stock_minimo} unidades</span>
    </div>
    <div class="info-row">
      <span class="info-label">Total vendido:</span>
      <span class="info-value">${producto.ventas} unidades</span>
    </div>
  `;
  
  modal.classList.add('active');
}

function cerrarModalProducto() {
  document.getElementById('modalProducto').classList.remove('active');
  productoSeleccionadoModal = null;
}

function eliminarProductoActual() {
  if (!productoSeleccionadoModal) return;
  
  if (confirm(`¿Está seguro de eliminar el producto "${productoSeleccionadoModal.nombre}"?`)) {
    productos = productos.filter(p => p.codigo !== productoSeleccionadoModal.codigo);
    cerrarModalProducto();
    actualizarInventario();
    actualizarSelectProductos();
    actualizarDashboard();
    mostrarNotificacion('✅', 'Producto eliminado', 'El producto ha sido eliminado correctamente');
  }
}

// Ventas
function actualizarSelectProductos() {
  const select = document.getElementById('productoVenta');
  select.innerHTML = '<option value="">Seleccionar producto...</option>';
  
  productos.forEach(producto => {
    const option = document.createElement('option');
    option.value = producto.codigo;
    option.textContent = `${producto.nombre} (${producto.codigo}) - ${formatearMoneda(producto.precio)}`;
    select.appendChild(option);
  });
}

function mostrarInfoProducto() {
  const codigo = document.getElementById('productoVenta').value;
  const infoDiv = document.getElementById('infoProductoVenta');
  
  if (!codigo) {
    infoDiv.style.display = 'none';
    return;
  }
  
  const producto = productos.find(p => p.codigo === codigo);
  if (producto) {
    document.getElementById('precioUnitario').textContent = formatearMoneda(producto.precio);
    document.getElementById('stockDisponible').textContent = `${producto.stock} unidades`;
    infoDiv.style.display = 'block';
    calcularTotalVenta();
  }
}

function calcularTotalVenta() {
  const codigo = document.getElementById('productoVenta').value;
  const cantidad = parseInt(document.getElementById('cantidadVenta').value) || 0;
  
  if (!codigo || cantidad <= 0) {
    document.getElementById('totalVenta').textContent = '$0';
    return;
  }
  
  const producto = productos.find(p => p.codigo === codigo);
  if (producto) {
    const total = producto.precio * cantidad;
    document.getElementById('totalVenta').textContent = formatearMoneda(total);
  }
}

function registrarVenta() {
  const codigo = document.getElementById('productoVenta').value;
  const cantidad = parseInt(document.getElementById('cantidadVenta').value);
  
  if (!codigo || !cantidad || cantidad <= 0) {
    alert('Por favor complete todos los campos correctamente');
    return;
  }
  
  const producto = productos.find(p => p.codigo === codigo);
  if (!producto) {
    alert('Producto no encontrado');
    return;
  }
  
  if (cantidad > producto.stock) {
    alert(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`);
    return;
  }
  
  // Actualizar stock
  producto.stock -= cantidad;
  producto.ventas += cantidad;
  
  // Calcular monto
  const monto = producto.precio * cantidad;
  
  // Actualizar caja
  saldoCaja += monto;
  
  // Registrar transacción
  transacciones.push({
    tipo: 'venta',
    producto: producto.nombre,
    cantidad: cantidad,
    monto: monto,
    fecha: new Date().toISOString()
  });
  
  // Limpiar formulario
  document.getElementById('formVenta').reset();
  document.getElementById('infoProductoVenta').style.display = 'none';
  document.getElementById('totalVenta').textContent = '$0';
  
  // Actualizar vistas
  actualizarDashboard();
  actualizarInventario();
  
  // Mostrar confirmación
  mostrarNotificacion('✅', '¡Venta registrada!', `Se vendieron ${cantidad} unidades de ${producto.nombre} por ${formatearMoneda(monto)}`);
}

// Caja
function actualizarCaja() {
  document.getElementById('saldoActual').textContent = formatearMoneda(saldoCaja);
  
  // Calcular totales
  const totalVentas = transacciones
    .filter(t => t.tipo === 'venta')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const totalIngresos = transacciones
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const totalGastos = transacciones
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.monto, 0);
  
  document.getElementById('totalVentas').textContent = formatearMoneda(totalVentas);
  document.getElementById('totalIngresos').textContent = formatearMoneda(totalIngresos);
  document.getElementById('totalGastos').textContent = formatearMoneda(totalGastos);
  
  // Listar transacciones
  const lista = document.getElementById('listaTransacciones');
  lista.innerHTML = '';
  
  if (transacciones.length === 0) {
    lista.innerHTML = '<div class="empty-state">No hay transacciones registradas</div>';
    return;
  }
  
  // Ordenar por fecha descendente
  const transaccionesOrdenadas = [...transacciones].sort((a, b) => 
    new Date(b.fecha) - new Date(a.fecha)
  );
  
  transaccionesOrdenadas.forEach(transaccion => {
    const item = crearTransaccionItem(transaccion);
    lista.appendChild(item);
  });
}

function crearTransaccionItem(transaccion) {
  const item = document.createElement('div');
  item.className = 'transaccion-item';
  
  let tipoTexto = '';
  let montoClass = '';
  let detalles = '';
  
  if (transaccion.tipo === 'venta') {
    tipoTexto = '🛒 Venta';
    montoClass = 'positivo';
    detalles = `${transaccion.producto} (${transaccion.cantidad} unid.)`;
  } else if (transaccion.tipo === 'ingreso') {
    tipoTexto = '💵 Ingreso';
    montoClass = 'positivo';
    detalles = transaccion.descripcion || 'Ingreso adicional';
  } else if (transaccion.tipo === 'gasto') {
    tipoTexto = '💸 Gasto';
    montoClass = 'negativo';
    detalles = transaccion.descripcion || 'Gasto/Retiro';
  }
  
  const signo = montoClass === 'positivo' ? '+' : '-';
  const fecha = new Date(transaccion.fecha);
  const fechaFormateada = fecha.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  item.innerHTML = `
    <div class="transaccion-header">
      <span class="transaccion-tipo">${tipoTexto}</span>
      <span class="transaccion-monto ${montoClass}">${signo}${formatearMoneda(Math.abs(transaccion.monto))}</span>
    </div>
    <div class="transaccion-detalles">${detalles}</div>
    <div class="transaccion-fecha">${fechaFormateada}</div>
  `;
  
  return item;
}

function mostrarFormularioTransaccion(tipo) {
  const form = document.getElementById('formTransaccion');
  const titulo = document.getElementById('tituloTransaccion');
  
  if (tipo === 'ingreso') {
    titulo.textContent = '💵 Registrar Ingreso';
  } else {
    titulo.textContent = '💸 Registrar Gasto';
  }
  
  form.style.display = 'block';
  form.dataset.tipoTransaccion = tipo;
  document.getElementById('formNuevaTransaccion').reset();
}

function cancelarTransaccion() {
  document.getElementById('formTransaccion').style.display = 'none';
}

function guardarTransaccion() {
  const descripcion = document.getElementById('descripcionTransaccion').value;
  const monto = parseFloat(document.getElementById('montoTransaccion').value);
  const tipo = document.getElementById('formTransaccion').dataset.tipoTransaccion;
  
  if (!descripcion || !monto || monto <= 0) {
    alert('Por favor complete todos los campos correctamente');
    return;
  }
  
  // Actualizar saldo
  if (tipo === 'ingreso') {
    saldoCaja += monto;
  } else {
    saldoCaja -= monto;
  }
  
  // Registrar transacción
  transacciones.push({
    tipo: tipo,
    descripcion: descripcion,
    monto: monto,
    fecha: new Date().toISOString()
  });
  
  // Cerrar formulario y actualizar
  cancelarTransaccion();
  actualizarCaja();
  actualizarDashboard();
  
  const tipoTexto = tipo === 'ingreso' ? 'Ingreso registrado' : 'Gasto registrado';
  mostrarNotificacion('✅', tipoTexto, `${descripcion}: ${formatearMoneda(monto)}`);
}

// Agregar producto
function agregarProducto() {
  const nombre = document.getElementById('nombreProducto').value.trim();
  const codigo = document.getElementById('codigoProducto').value.trim().toUpperCase();
  const precio = parseFloat(document.getElementById('precioProducto').value);
  const stock = parseInt(document.getElementById('stockProducto').value);
  const stock_minimo = parseInt(document.getElementById('stockMinimoProducto').value);
  
  // Validaciones
  if (!nombre || !codigo || !precio || precio <= 0 || stock < 0) {
    alert('Por favor complete todos los campos correctamente');
    return;
  }
  
  // Verificar código duplicado
  if (productos.find(p => p.codigo === codigo)) {
    alert('Ya existe un producto con ese código');
    return;
  }
  
  // Agregar producto
  productos.push({
    nombre: nombre,
    codigo: codigo,
    precio: precio,
    stock: stock,
    stock_minimo: stock_minimo,
    ventas: 0
  });
  
  // Limpiar formulario
  document.getElementById('formAgregarProducto').reset();
  document.getElementById('stockMinimoProducto').value = 5;
  
  // Actualizar vistas
  actualizarDashboard();
  actualizarInventario();
  actualizarSelectProductos();
  
  // Mostrar confirmación
  mostrarNotificacion('✅', 'Producto agregado', `${nombre} ha sido agregado al inventario`);
}

// Reportes
function actualizarReportes() {
  // Productos más vendidos
  const topProductosDiv = document.getElementById('topProductos');
  const productosOrdenados = [...productos].sort((a, b) => b.ventas - a.ventas);
  
  topProductosDiv.innerHTML = '';
  if (productosOrdenados.length === 0 || productosOrdenados.every(p => p.ventas === 0)) {
    topProductosDiv.innerHTML = '<div class="empty-state">No hay ventas registradas</div>';
  } else {
    productosOrdenados.slice(0, 5).forEach(producto => {
      if (producto.ventas > 0) {
        const item = document.createElement('div');
        item.className = 'reporte-item';
        item.innerHTML = `
          <span class="reporte-nombre">${producto.nombre}</span>
          <span class="reporte-valor">${producto.ventas} unidades</span>
        `;
        topProductosDiv.appendChild(item);
      }
    });
  }
  
  // Productos con stock bajo
  const stockBajoDiv = document.getElementById('stockBajoLista');
  const productosBajo = productos.filter(p => p.stock <= p.stock_minimo);
  
  stockBajoDiv.innerHTML = '';
  if (productosBajo.length === 0) {
    stockBajoDiv.innerHTML = '<div class="empty-state">Todos los productos tienen stock suficiente</div>';
  } else {
    productosBajo.forEach(producto => {
      const item = document.createElement('div');
      item.className = 'reporte-item';
      item.innerHTML = `
        <span class="reporte-nombre">${producto.nombre} (${producto.codigo})</span>
        <span class="reporte-valor" style="color: var(--color-error);">${producto.stock} unidades</span>
      `;
      stockBajoDiv.appendChild(item);
    });
  }
  
  // Resumen de ventas
  const resumenDiv = document.getElementById('resumenVentas');
  const totalVentasUnidades = productos.reduce((sum, p) => sum + p.ventas, 0);
  const totalVentasMonto = transacciones
    .filter(t => t.tipo === 'venta')
    .reduce((sum, t) => sum + t.monto, 0);
  const totalTransacciones = transacciones.filter(t => t.tipo === 'venta').length;
  
  resumenDiv.innerHTML = `
    <div class="reporte-item">
      <span class="reporte-nombre">Total de ventas</span>
      <span class="reporte-valor">${totalTransacciones} transacciones</span>
    </div>
    <div class="reporte-item">
      <span class="reporte-nombre">Unidades vendidas</span>
      <span class="reporte-valor">${totalVentasUnidades} unidades</span>
    </div>
    <div class="reporte-item">
      <span class="reporte-nombre">Ingresos por ventas</span>
      <span class="reporte-valor">${formatearMoneda(totalVentasMonto)}</span>
    </div>
  `;
}

// Utilidades
function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(valor);
}

function mostrarNotificacion(icono, titulo, mensaje) {
  const modal = document.getElementById('modalConfirmacion');
  document.getElementById('modalIcon').textContent = icono;
  document.getElementById('modalTitulo').textContent = titulo;
  document.getElementById('modalMensaje').textContent = mensaje;
  modal.classList.add('active');
}

function cerrarModal() {
  document.getElementById('modalConfirmacion').classList.remove('active');
}