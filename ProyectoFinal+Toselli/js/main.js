// DEFINICIÓN DE VARIABLES FIJAS

const IVA = 0.21
const INTERES = 0.07

// REFERENCIAS A UTILIZAR
const form = document.querySelector('.formulario');
const nombreInput = document.querySelector('#nombre');
const precioInput = document.querySelector('#precio');
const tablaProductos = document.querySelector('#productos-agregados');
const btnLimpiar = document.querySelector('.btn-clear');
const tipoUSD = document.querySelector('.tipo-usd')
const cotizacion = document.querySelector('.cotizacion')

//COTIZADOR USD

let USDurl = "https://www.dolarsi.com/api/api.php?type=valoresprincipales"      // designamos la variable USDurl con el link a la api de Dolar Si

tipoUSD.addEventListener('change', () => {      // hacemos un listener tipo "change" al select de los tipos de dólar
    const dolarSeleccionado = tipoUSD.value

    // Hacemos un fetch a la api de Dolar para que nos traiga la info almacenada en las variables "nombre", "compra" y "venta"
    fetch(USDurl)
        .then(resp => resp.json())
        .then(data => {
            const filtroUSD = data.filter(cambio => cambio.casa.nombre.includes(dolarSeleccionado))

            filtroUSD.forEach(cambio => {
                cotizacion.innerHTML = `
                    <h3>${cambio.casa.nombre}</h3>
                    <p>Compra: <span class='valor-red'>$${cambio.casa.compra}</span></p>
                    <p>Venta: <span class='valor-grn'>$${cambio.casa.venta}</span></p>
                `
            })
        })
        .catch(err => console.log("No se obtuvo ningún dato", err))
})



// FUNCIÓN PARA AGREGAR PRODUCTO AL LOCALSTORAGE

function agregarProducto() {
    // Validación con Toastify
    if (nombreInput.value === '' || precioInput.value === '') {
        Toastify({
            text: "Todos los campos son obligatorios",
            duration: 4000
        }).showToast();
        return
    }

    // Obtenemos los valores de los inputs del formulario
    const nombre = nombreInput.value;
    const precio = parseFloat(precioInput.value);

    // Creamos un objeto con los datos del nuevo producto
    const producto = {
        nombre,
        precio
    };

    // Agregamos el producto al localStorage
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos.push(producto);
    localStorage.setItem('productos', JSON.stringify(productos));

    // Actualizamos la tabla de productos
    actualizarTabla(productos);

    // Limpiamos los inputs del formulario
    nombreInput.value = '';
    precioInput.value = '';
}

// ACTUALIZAR LA LISTA DE PRODUCTOS - Función principal para levantar objetos agregados y trabajar con ellos

function actualizarTabla(productos) {
    // Limpiamos la tabla
    tablaProductos.innerHTML = '';

    // Recorremos la lista de productos y agregamos cada uno a la tabla celda por celda
    for (const producto of productos) {
        // Creamos una nueva fila en la tabla
        const fila = document.createElement('tr');

        // Creamos la celda para el botón de eliminar producto
        const eliminarProducto = document.createElement('td');
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'X';
        botonEliminar.addEventListener('click', () => {
            // Eliminamos el producto correspondiente del array
            const index = productos.indexOf(producto);
            productos.splice(index, 1);
            localStorage.setItem('productos', JSON.stringify(productos));
            // Actualizamos la tabla
            actualizarTabla(productos);
        });
        eliminarProducto.appendChild(botonEliminar);
        fila.appendChild(eliminarProducto);

        // Agregamos las celdas a la fila con los datos del producto
        const nombreCelda = document.createElement('td');
        nombreCelda.textContent = producto.nombre;
        fila.appendChild(nombreCelda);

        const precioCelda = document.createElement('td');
        precioCelda.textContent = "$" + producto.precio.toFixed(2);
        fila.appendChild(precioCelda);

        const metodoPagoCelda = document.createElement('td');   // Agregamos un desplegable para seleccionar tipo de pago
        metodoPagoCelda.innerHTML = `
            <select class='opcionesPago'>
                <option value="seleccionar">--Seleccionar--</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
            </select>
        `;
        fila.appendChild(metodoPagoCelda);

        // OPERACIONES DE PRECIOS

        const pagoARS = () => producto.precio + (producto.precio * IVA) // Creamos la función para agregar IVA al precio de lista

        const total6cuotas = function () {  // Creamos la función para sacar el total con interés para las 6 cuotas
            let resultado = (producto.precio + (producto.precio * (INTERES * 6))) * IVA + (producto.precio + (producto.precio * (INTERES * 6)));   // Se propone un incremento fijo mensual de 7% y no variable como es en la realidad, por lo que multiplicamos el INTERES (0,07) por las 6 cuotas. Entonces sumamos el precio de lista + el interes. A esto lo multiplicamos por el IVA y se lo sumamos al precio total
            return resultado.toFixed(2);
        }

        const total12cuotas = function () {  // creamos la función para sacar el total con interés para las 12 cuotas
            let resultado = (producto.precio + (producto.precio * (INTERES * 12))) * IVA + (producto.precio + (producto.precio * (INTERES * 12)));   // Hacemos lo mismo con 12 cuotas.
            return resultado.toFixed(2);
        }

        // CREADOR DE CELDAS

        const cuotasCelda = document.createElement('td');   // Creamos la celda de cuotas
        cuotasCelda.setAttribute('class', "celdaCuota");

        const precioFinalCelda = document.createElement('td')   // Creamos la celda de Precio Final

        const opcionesPago = metodoPagoCelda.querySelector('.opcionesPago') // Creamos la variable "opcionesPago" tomando la class .opcionesPago
        opcionesPago.addEventListener("change", function () {   // Creamos la función para modificar el valor de la celda según...
            if (opcionesPago.value === "seleccionar") {         //... si no se selecciona método de pago
                cuotasCelda.textContent = 'No seleccionado'
                fila.appendChild(cuotasCelda)
                precioFinalCelda.textContent = '-'
                fila.appendChild(precioFinalCelda)
            } else if (opcionesPago.value === 'Efectivo') {     //... si se selecciona Efectivo
                cuotasCelda.textContent = '1 Pago';             // en Cuotas aparece "1 Pago"
                fila.appendChild(cuotasCelda)
                precioFinalCelda.textContent = "$" + pagoARS(producto.precio).toFixed(2) + " (+IVA incluido)"
                fila.appendChild(precioFinalCelda)              // en Precio final aparece el precio de lista +IVA
            } else if (opcionesPago.value === 'Tarjeta') {      // si se selecciona Tarjeta, aparece un nuevo desplegable en la celda "Cuotas"
                cuotasCelda.innerHTML = `
                <select class='seleccionarCuotas'>
                <option value="seleccionarCuota">--Seleccionar--</option>
                <option value="1cuota">1 --sin interés--</option>
                <option value="3cuotas">3 --sin interés--</option>
                <option value="6cuotas">6</option>
                <option value="12cuotas">12</option>
                </select>
                `;
                fila.appendChild(cuotasCelda)
                precioFinalCelda.textContent = '-'
                fila.appendChild(precioFinalCelda)

                // OPERACIONES CON CUOTAS

                const cantidadCuotas = cuotasCelda.querySelector('.seleccionarCuotas')    // seleccionamos bajo la class ".seleccionarCuotas" asignada al desplegable de arriba

                cantidadCuotas.addEventListener("change", function () {   // Creamos la función para que calcule el precio según:...
                    if (cantidadCuotas.value === "seleccionarCuota") {    //... no se selecciona nada
                        precioFinalCelda.textContent = '-';
                        cuotasCelda.textContent = 'No seleccionado';
                    } else if (cantidadCuotas.value === '1cuota') {       // se selecciona "1 --sin interés--" 
                        precioFinalCelda.textContent = "1 x $" + pagoARS(producto.precio) + " (+IVA incluido)";
                        fila.appendChild(precioFinalCelda);             // precio final sin interes +IVA
                    } else if (cantidadCuotas.value === '3cuotas') {      //... se selecciona "3 --sin interés--"
                        precioFinalCelda.textContent = "3 x $" + (pagoARS(producto.precio) / 3).toFixed(2) + " = $" + pagoARS(producto.precio) + " (+IVA incluido)";        // precio final sin interés + IVA en 3 pagos
                        fila.appendChild(precioFinalCelda);
                    } else if (cantidadCuotas.value === '6cuotas') {      //... se selecciona "6" con interés
                        precioFinalCelda.textContent = "6 x $" + (total6cuotas(producto.precio) / 6).toFixed(2) + " = $" + total6cuotas(producto.precio) + " (+IVA incluido)";
                        fila.appendChild(precioFinalCelda);             // precio final con interés + IVA en 6 pagos
                    } else if (cantidadCuotas.value === '12cuotas') {     //... se selecciona "12" con interés
                        precioFinalCelda.textContent = "12 x $" + (total12cuotas(producto.precio) / 12).toFixed(2) + " = $" + total12cuotas(producto.precio) + " (+IVA incluido)";
                        fila.appendChild(precioFinalCelda);             // precio final con interés +IVA en 12 pagos
                    }

                    fila.appendChild(cuotasCelda)               // Agregamos el valor a la celda
                    fila.appendChild(precioFinalCelda);         //Agregamos el precio final a la celda                 
                })
            }
        })

        // Agregamos la fila del producto a la tabla
        tablaProductos.appendChild(fila); 
    }
}

// Verificamos que al cargar la página siempre en el localStorage tengamos un array vacío

const productosGuardados = JSON.parse(localStorage.getItem('productos')) || []; // realizamos una operación de OR que verifica lo que hay en el local storage, entonces nos garantiza que siempre devuelve un array vacío
actualizarTabla(productosGuardados);

// Agregamos un evento al formulario para detectar el envío, prevenimos la acción por defecto y asignamos la función "agregarProducto()" en su lugar

form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    agregarProducto();
});

// LIMPIAR LA TABLA Y LOCAL STORAGE (utilizando sweetalert2 con una ventana de Confirm)

function limpiarTabla() {
    if (tablaProductos.innerHTML === '') {
        Swal.fire('No hay productos agregados')
    } else {
        Swal.fire({
            title: 'Limpiar tabla?',
            text: "Si limpias la tabla no podrás recuperar los datos ingresados",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, limpiar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {

                // la función para que la tabla aparezca un string vacío se asigna al "onclick" del botón "limpiar" de html
                tablaProductos.innerHTML = '';

                // Limpiamos el localStorage
                localStorage.removeItem('productos');   // borramos lo almacenado en el local

                Swal.fire(
                    'Eliminada!',
                    'La tabla ha sido limpiada',
                    'success'
                )
            }
        })
    }
}


// Agregamos un evento al botón de "Limpiar tabla"

btnLimpiar.addEventListener('click', limpiarTabla);