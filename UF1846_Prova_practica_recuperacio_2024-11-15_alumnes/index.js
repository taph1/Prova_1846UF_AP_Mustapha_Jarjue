const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4000;

// Ruta correcta al archivo 'ventas.json' en la carpeta 'data'
const ventasFilePath = path.join(__dirname, 'data', 'ventas.json');

// Middleware para manejar respuestas JSON
app.use(express.json());

// Ruta 1: Devuelve la lista completa de clientes ordenados alfabéticamente por apellido
app.get('/api', (req, res) => {
  fs.readFile(ventasFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error al leer el archivo:", err); // Imprime el error
      return res.status(500).json({ error: 'No se pudo cargar los datos.' });
    }

    try {
      const clientes = JSON.parse(data);
      const clientesOrdenados = clientes.sort((a, b) => a.apellido_cliente.localeCompare(b.apellido_cliente));
      res.json(clientesOrdenados);
    } catch (parseError) {
      console.error("Error al parsear los datos:", parseError); // Imprime el error de parseo
      res.status(500).json({ error: 'Error al parsear los datos.' });
    }
  });
});

// Ruta 2: Devuelve la lista de las compras realizadas en la tienda indicada
app.get('/api/tienda/:ciudad', (req, res) => {
  const ciudad = req.params.ciudad;
  fs.readFile(ventasFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error al leer el archivo:", err); // Imprime el error
      return res.status(500).json({ error: 'No se pudo cargar los datos.' });
    }

    try {
      const clientes = JSON.parse(data);
      const comprasTienda = clientes.filter(cliente => cliente.tienda.toLowerCase() === ciudad.toLowerCase());
      if (comprasTienda.length === 0) return res.status(404).json({ message: 'No se encontraron compras en esta tienda.' });
      res.json(comprasTienda);
    } catch (parseError) {
      console.error("Error al parsear los datos:", parseError); // Imprime el error de parseo
      res.status(500).json({ error: 'Error al parsear los datos.' });
    }
  });
});

// Ruta 3: Devuelve la lista de los clientes con el nombre y apellido indicado
app.get('/api/apellido_nombre/:apellido/:nombre', (req, res) => {
  const { apellido, nombre } = req.params;
  fs.readFile(ventasFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error al leer el archivo:", err); // Imprime el error
      return res.status(500).json({ error: 'No se pudo cargar los datos.' });
    }

    try {
      const clientes = JSON.parse(data);
      const clientesEncontrados = clientes.filter(cliente =>
        cliente.apellido_cliente.toLowerCase() === apellido.toLowerCase() &&
        cliente.nombre_cliente.toLowerCase() === nombre.toLowerCase()
      );
      if (clientesEncontrados.length === 0) return res.status(404).json({ message: 'Cliente no encontrado.' });
      res.json(clientesEncontrados);
    } catch (parseError) {
      console.error("Error al parsear los datos:", parseError); // Imprime el error de parseo
      res.status(500).json({ error: 'Error al parsear los datos.' });
    }
  });
});

// Ruta 4: Devuelve la lista de los clientes con el apellido y primeras letras del nombre indicado
app.get('/api/apellido/:apellido', (req, res) => {
  const { apellido } = req.params;
  const nombreInicial = req.query.nombre;

  if (!nombreInicial) {
    return res.status(400).json({ message: 'Falta el parámetro nombre' });
  }

  fs.readFile(ventasFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error al leer el archivo:", err); // Imprime el error
      return res.status(500).json({ error: 'No se pudo cargar los datos.' });
    }

    try {
      const clientes = JSON.parse(data);
      const clientesEncontrados = clientes.filter(cliente =>
        cliente.apellido_cliente.toLowerCase() === apellido.toLowerCase() &&
        cliente.nombre_cliente.toLowerCase().startsWith(nombreInicial.toLowerCase())
      );
      res.json(clientesEncontrados);
    } catch (parseError) {
      console.error("Error al parsear los datos:", parseError); // Imprime el error de parseo
      res.status(500).json({ error: 'Error al parsear los datos.' });
    }
  });
});

// Ruta 5: Devuelve la lista de los productos comprados de una marca indicada
app.get('/api/marca/:marca', (req, res) => {
  const marca = req.params.marca;
  fs.readFile(ventasFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error al leer el archivo:", err); // Imprime el error
      return res.status(500).json({ error: 'No se pudo cargar los datos.' });
    }

    try {
      const clientes = JSON.parse(data);
      const productosMarca = clientes.flatMap(cliente =>
        cliente.compras.filter(compra => compra.marca.toLowerCase() === marca.toLowerCase())
      );
      if (productosMarca.length === 0) return res.status(404).json({ message: 'No se encontraron productos de esta marca.' });
      res.json(productosMarca);
    } catch (parseError) {
      console.error("Error al parsear los datos:", parseError); // Imprime el error de parseo
      res.status(500).json({ error: 'Error al parsear los datos.' });
    }
  });
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor levantado en http://localhost:${port}`);
});
