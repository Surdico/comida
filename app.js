'use strict';

// Opcional: coloca tus datos para que el aviso llegue directo a ti.
// WhatsApp: código de país + número, sin "+", sin espacios ni guiones.
// Correo: dirección completa.
const CONTACTO = {
  whatsapp: '',
  email: '',
};

const COMIDAS = [
  { id: 'sushi', nombre: 'Sushi', emoji: '🍣', tono: '#e4f1ec', acento: '#2f6b56' },
  { id: 'hamburguesas', nombre: 'Hamburguesas', emoji: '🍔', tono: '#fbe9dc', acento: '#a24b23' },
  { id: 'pizza', nombre: 'Pizza', emoji: '🍕', tono: '#fce9e5', acento: '#b03a32' },
  { id: 'shawarma', nombre: 'Shawarma', emoji: '🌯', tono: '#f6edda', acento: '#87611f' },
  { id: 'tacos', nombre: 'Tacos', emoji: '🌮', tono: '#eef2da', acento: '#5e7024' },
  { id: 'ramen', nombre: 'Ramen', emoji: '🍜', tono: '#efe7f6', acento: '#6b4b8c' },
  { id: 'pollo', nombre: 'Pollo frito', emoji: '🍗', tono: '#fcebda', acento: '#a65c1e' },
  { id: 'pasta', nombre: 'Pasta', emoji: '🍝', tono: '#f1ebdd', acento: '#75643c' },
];

const grid = document.getElementById('grid');
const estado = document.getElementById('estado');
const aviso = document.getElementById('aviso');
const avisoEleccion = document.getElementById('aviso-eleccion');
const avisoWhatsapp = document.getElementById('aviso-whatsapp');
const avisoCorreo = document.getElementById('aviso-correo');
const otraForm = document.getElementById('otra-form');
const otraOpcion = document.getElementById('otra-opcion');

const comidas = COMIDAS.slice();
let contadorOtras = 0;

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function crearBoton(comida) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'comida';
  boton.dataset.id = comida.id;
  boton.setAttribute('aria-pressed', 'false');
  boton.style.setProperty('--tono', comida.tono);
  boton.style.setProperty('--cat', comida.acento);

  const emoji = document.createElement('span');
  emoji.className = 'comida-emoji';
  emoji.setAttribute('aria-hidden', 'true');
  emoji.textContent = comida.emoji;

  const nombre = document.createElement('span');
  nombre.className = 'comida-nombre';
  nombre.textContent = comida.nombre;

  const check = document.createElement('span');
  check.className = 'comida-check';
  check.setAttribute('aria-hidden', 'true');
  check.textContent = '✓';

  boton.append(emoji, nombre, check);
  return boton;
}

function mostrarAviso(comida) {
  const mensaje = encodeURIComponent(`Elegí ${comida.nombre} para comer.`);
  const asunto = encodeURIComponent(`Mi elección: ${comida.nombre}`);
  const numero = CONTACTO.whatsapp.replace(/\D/g, '');
  const correo = CONTACTO.email.trim();

  avisoEleccion.textContent = comida.nombre;

  avisoWhatsapp.href = numero
    ? `https://wa.me/${numero}?text=${mensaje}`
    : `https://wa.me/?text=${mensaje}`;
  avisoWhatsapp.setAttribute('aria-label', `Avisar ${comida.nombre} por WhatsApp`);

  avisoCorreo.href = correo
    ? `mailto:${correo}?subject=${asunto}&body=${mensaje}`
    : `mailto:?subject=${asunto}&body=${mensaje}`;
  avisoCorreo.setAttribute('aria-label', `Avisar ${comida.nombre} por correo`);

  aviso.hidden = false;
  document.body.classList.add('con-aviso');
}

function ocultarAviso() {
  aviso.hidden = true;
  avisoEleccion.textContent = '';
  document.body.classList.remove('con-aviso');
}

function seleccionar(boton) {
  const comida = comidas.find((item) => item.id === boton.dataset.id);
  if (!comida) return;

  grid.querySelectorAll('.comida').forEach((opcion) => {
    opcion.setAttribute('aria-pressed', 'false');
  });
  boton.setAttribute('aria-pressed', 'true');
  estado.textContent = `Elegiste ${comida.nombre}.`;
  mostrarAviso(comida);
}

function enfocar(boton) {
  boton.focus({ preventScroll: true });
  if (window.matchMedia('(max-width: 620px)').matches) {
    const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    boton.scrollIntoView({ block: 'center', behavior: movimiento });
  }
}

COMIDAS.forEach((comida) => {
  grid.append(crearBoton(comida));
});

grid.addEventListener('click', (evento) => {
  const boton = evento.target.closest('.comida');
  if (!boton) return;

  const yaElegida = boton.getAttribute('aria-pressed') === 'true';

  grid.querySelectorAll('.comida').forEach((opcion) => {
    opcion.setAttribute('aria-pressed', 'false');
  });

  if (yaElegida) {
    estado.textContent = 'Ninguna comida seleccionada.';
    ocultarAviso();
    return;
  }

  seleccionar(boton);
});

otraForm.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nombre = otraOpcion.value.trim().replace(/\s+/g, ' ');
  if (!nombre) {
    otraOpcion.value = '';
    otraOpcion.focus();
    return;
  }

  const existente = comidas.find((comida) => normalizar(comida.nombre) === normalizar(nombre));
  if (existente) {
    const botonExistente = grid.querySelector(`[data-id="${existente.id}"]`);
    if (botonExistente) {
      seleccionar(botonExistente);
      enfocar(botonExistente);
    }
    otraOpcion.value = '';
    return;
  }

  contadorOtras += 1;
  const nueva = {
    id: `otra-${contadorOtras}`,
    nombre,
    emoji: '🍽️',
    tono: '#f1ece2',
    acento: '#75643c',
  };

  comidas.push(nueva);
  const nuevoBoton = crearBoton(nueva);
  grid.append(nuevoBoton);
  seleccionar(nuevoBoton);
  otraOpcion.value = '';
  enfocar(nuevoBoton);
});
