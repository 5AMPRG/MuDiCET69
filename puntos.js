/* ============================================================
   puntos.js · Información del Museo Digital CETIS 69
   Este es el único archivo que necesitas editar para cambiar textos, fotos,
   vitrinas, placas, galerías automáticas, bocinas y la guía de uso.
   Va en la misma carpeta que recorrido.html.

   Los textos marcados con ✏️ son de ejemplo: cámbialos por los reales.
   ============================================================ */

/* ------------------------------------------------------------
   MAPA
   La imagen es la vista desde arriba del museo (tu mapa-museo3D.png).
   a, b y c convierten coordenadas del modelo (x, z) a píxeles de la imagen:
     px = a[0]*x + b[0]*z + c[0]     py = a[1]*x + b[1]*z + c[1]
   (ya están calculados con las 21 macetas; no hace falta tocarlos)
   ------------------------------------------------------------ */
export const MAPA = {
  imagen: "mapa-museo3D.png",
  ancho: 871,
  alto: 873,
  a: [2.33523546, 0.000920255],
  b: [-0.00682343, 2.34246727],
  c: [435.230382, 445.104189],
  zoomMinimapa: 0.75        /* más alto = más cerca en el mapa de la esquina */
};

/* ------------------------------------------------------------
   PUNTOS DE INFORMACIÓN
   Al apuntar con la mira (o tocar en el celular) un objeto cuyo nombre en el
   modelo coincida con "objeto", se abre esta tarjeta.
     objeto   : nombre del objeto en Blender (se escribe como expresión regular)
     titulo   : encabezado de la tarjeta
     etiqueta : categoría pequeña arriba del título
     texto    : un párrafo, o una lista de párrafos
     imagenes : lista de fotos, por ejemplo ["fotos/mural1.jpg"]
     video    : un video, por ejemplo "videos/historia.mp4"
     distancia: a qué distancia se puede abrir (por defecto 45)
   Si agregas un objeto nuevo en Blender, solo agrega otra entrada aquí.
   ------------------------------------------------------------ */
export const PUNTOS = [
  {
    id: "pantera",
    extra: "pantera",                 /* la pantera se carga aparte, no está en el modelo principal */
    titulo: "Monumento a la Pantera",
    etiqueta: "Monumento",
    texto: [
      "✏️ Escribe aquí la historia del monumento: quién lo hizo, en qué año se inauguró y qué significa para la comunidad del CETIS 69.",
      "Puedes agregar varios párrafos y fotos."
    ],
    imagenes: [],
    distancia: 60
  },
  {
    id: "letras",
    extra: "letras",
    titulo: "Letras CETIS 69",
    etiqueta: "Fachada",
    texto: "✏️ Cuenta aquí la historia del plantel y el significado del nombre.",
    distancia: 70
  },
  {
    id: "mural",
    objeto: "^mural$",
    titulo: "Mural del museo",
    etiqueta: "Arte",
    texto: "✏️ Describe el mural: autor, año, técnica y qué representa.",
    imagenes: [],
    distancia: 70
  },
  {
    id: "mural2",
    objeto: "^mural2$",
    titulo: "Mural lateral",
    etiqueta: "Arte",
    texto: "✏️ Describe este segundo mural.",
    distancia: 70
  },
  {
    id: "cuadro",
    objeto: "^cuadro$",
    titulo: "Cuadro principal",
    etiqueta: "Entrada",
    texto: "✏️ Texto de bienvenida al museo.",
    distancia: 60
  },
  {
    id: "d1980",
    objeto: "^los80$",
    titulo: "Década de 1980",
    etiqueta: "Línea del tiempo",
    texto: "✏️ Cuenta cómo era el plantel en los años 80: fundación, primeras generaciones, maestros y anécdotas.",
    imagenes: []
  },
  {
    id: "d1990",
    objeto: "^los90$",
    titulo: "Década de 1990",
    etiqueta: "Línea del tiempo",
    texto: "✏️ Cuenta lo más importante de los años 90.",
    imagenes: []
  },
  {
    id: "d2000",
    objeto: "^los2000$",
    titulo: "Década de 2000",
    etiqueta: "Línea del tiempo",
    texto: "✏️ Cuenta lo más importante de los años 2000.",
    imagenes: []
  },
  {
    id: "d2020",
    objeto: "^los2020$",
    titulo: "Década de 2020",
    etiqueta: "Línea del tiempo",
    texto: "✏️ Cuenta lo más importante de los años 2020.",
    imagenes: []
  },
  {
    id: "mostrador1",
    objeto: "^mostrador$",
    titulo: "Especialidades",
    etiqueta: "Mostrador",
    texto: "✏️ Explica qué especialidades se imparten y qué estudia cada una.",
    imagenes: []
  },
  {
    id: "mostrador2",
    objeto: "^mostrador2$",
    titulo: "Especialidades",
    etiqueta: "Mostrador",
    texto: "✏️ Información de otra especialidad.",
    imagenes: []
  },
  {
    id: "mostrador3",
    objeto: "^mostrador3$",
    titulo: "Especialidades",
    etiqueta: "Mostrador",
    texto: "✏️ Información de otra especialidad.",
    imagenes: []
  },
  {
    id: "expositor",
    objeto: "^(expositor|exibidorposter\\d*)$",
    titulo: "Exposición de carteles",
    etiqueta: "Exposición",
    texto: "✏️ Describe los carteles o trabajos que se muestran aquí.",
    imagenes: []
  },
  {
    id: "banners",
    objeto: "^banner\\d$",
    titulo: "Banners institucionales",
    etiqueta: "Institución",
    texto: "✏️ Mensaje o lema del plantel.",
    distancia: 60
  },
  {
    id: "fuentes",
    extra: "fuentes",
    titulo: "Fuentes del jardín",
    etiqueta: "Jardín",
    texto: "✏️ Cuenta cuándo se construyeron las fuentes y su significado.",
    distancia: 50
  },
  {
    id: "auditorio",
    objeto: "^aud_marco_pantalla$",
    titulo: "Auditorio",
    etiqueta: "Auditorio",
    texto: [
      "✏️ Capacidad, eventos que se realizan aquí y su historia.",
      "Tip: dentro del auditorio puedes sentarte con la tecla E, y hacer clic en la pantalla para pausar el video."
    ],
    distancia: 90
  }
];

/* ------------------------------------------------------------
   PLACA DEL MONUMENTO A LA PANTERA
   Se coloca sola en el pedestal, mirando hacia donde caminan los visitantes.
   ------------------------------------------------------------ */
export const PLACA_PANTERA = {
  activo: true,
  objeto: "^exibidor$",
  titulo: "LA PANTERA",
  subtitulo: "Monumento del CETIS 69",
  lineas: ["✏️ Obra de: __________", "Inaugurada en: ______", "Símbolo de orgullo y unidad"],
  infoId: "pantera",             /* al tocarla abre la tarjeta del punto "pantera" */
  ancho: 6.4,
  alto: 2.6,
  altura: 1.9                    /* altura del centro de la placa sobre el piso */
};

/* ------------------------------------------------------------
   VITRINAS DE CRISTAL (zona de las especialidades)
   x, z      : posición en el modelo (mira el mapa: px = 2.335*x + 435, py = 2.342*z + 445)
   giro      : rotación en radianes (0 = la placa mira a +z)
   contenido : piezas decorativas que se arman solas:
               "trofeo", "medalla", "prototipo", "robot", "engrane", "libro"
   modelos   : (opcional) archivos .glb de tus prototipos reales, por ejemplo ["proto1.glb"]
   Para cambiar el cartel y la tarjeta, edita titulo/texto.
   ------------------------------------------------------------ */
export const VITRINAS = [
  { id: "vit1", x: 2.5,  z: 20.5,  titulo: "Especialidad 1", contenido: ["trofeo", "prototipo", "libro"],
    texto: "✏️ Describe esta especialidad, sus prototipos y los premios que han ganado los alumnos." },
  { id: "vit2", x: 17.5, z: 20.5,  titulo: "Especialidad 2", contenido: ["robot", "medalla", "engrane"],
    texto: "✏️ Describe esta especialidad y sus logros." },
  { id: "vit3", x: 8,    z: -18.8, titulo: "Especialidad 3", contenido: ["trofeo", "engrane"],
    texto: "✏️ Describe esta especialidad y sus logros." },
  { id: "vit4", x: 23,   z: -18.8, titulo: "Especialidad 4", contenido: ["prototipo", "medalla", "libro"],
    texto: "✏️ Describe esta especialidad y sus logros." },
  { id: "vit5", x: -18.5, z: 1.4,  titulo: "Especialidad 5", contenido: ["robot", "trofeo"],
    texto: "✏️ Describe esta especialidad y sus logros." },
  { id: "vit6", x: -3,   z: 1.4,   titulo: "Especialidad 6", contenido: ["medalla", "prototipo", "engrane"],
    texto: "✏️ Describe esta especialidad y sus logros." }
];

/* ------------------------------------------------------------
   GALERÍAS AUTOMÁTICAS (para no acomodar foto por foto)
   Pon aquí la lista de fotos y se cuelgan solas, una junto a otra, a lo largo
   de una pared, respetando la proporción de cada foto.
     desde, hasta : extremos de la pared como [x, z] (mira el plano del museo)
     y            : altura del centro de las fotos
     alto         : altura de cada foto
     lado         : 1 o -1, hacia qué lado de la pared miran las fotos
   Cambia activo a true y escribe tus fotos.
   ------------------------------------------------------------ */
export const GALERIAS = [
  {
    activo: false,
    id: "galeria1",
    desde: [-27.5, -20],
    hasta: [-27.5, 15],
    y: 7.5,
    alto: 4.2,
    separacion: 1.2,
    lado: 1,
    imagenes: [
      { archivo: "fotos/foto1.jpg", titulo: "Foto 1", texto: "✏️ Descripción de la foto 1." },
      { archivo: "fotos/foto2.jpg", titulo: "Foto 2", texto: "✏️ Descripción de la foto 2." },
      { archivo: "fotos/foto3.jpg", titulo: "Foto 3", texto: "✏️ Descripción de la foto 3." }
    ]
  }
];

/* ------------------------------------------------------------
   BOCINAS DEL AUDITORIO
   El sonido del video sale de las bocinas. Se buscan objetos del modelo cuyo
   nombre contenga alguna de estas palabras (por ejemplo "bocina1", "bocina2").
   Si no hay ninguno, se usan dos bocinas a los lados de la pantalla.
   ------------------------------------------------------------ */
export const BOCINAS = {
  objeto: "bocina|altavoz|parlante|speaker",
  ganancia: 2.6,        /* volumen dentro del auditorio */
  distanciaReferencia: 14
};

/* ------------------------------------------------------------
   BUTACAS DEL AUDITORIO (para sentarse con la tecla E)
   columnasX son las 30 columnas medidas del modelo; z0, paso y filas definen
   las 13 filas. Si cambias las butacas en Blender, ajusta estos valores.
   ------------------------------------------------------------ */
export const ASIENTOS = {
  columnasX: [-147.55, -145.45, -143.35, -141.25, -139.15, -137.05, -134.95, -132.85, -130.75, -128.65,
    -126.55, -124.45, -122.35, -120.25, -118.15, -109.25, -107.15, -105.05, -102.95, -100.85,
    -98.75, -96.65, -94.55, -92.45, -90.35, -88.25, -86.15, -84.05, -81.95, -79.85],
  z0: 2.2,
  paso: 4.5,
  filas: 13,
  desplazamiento: 2.2,     /* del inicio de la fila al centro del asiento */
  alturaOjos: 3.1,         /* altura de los ojos sentado, sobre el piso de la butaca */
  distanciaMaxima: 3.6     /* a qué distancia de un asiento aparece "Sentarse" */
};

/* ------------------------------------------------------------
   GUÍA RÁPIDA (se muestra la primera vez que entras y con el botón "?")
   para: "pc", "tactil" o "todos"
   ------------------------------------------------------------ */
export const GUIA = [
  { para: "pc",     icono: "fa-keyboard",        titulo: "Caminar",      texto: "W A S D o las flechas. Mantén Shift para correr." },
  { para: "pc",     icono: "fa-computer-mouse",  titulo: "Mirar",        texto: "Mueve el mouse. Esc pausa el recorrido." },
  { para: "pc",     icono: "fa-hand-pointer",    titulo: "Ver información", texto: "Apunta con el punto del centro a un mural, vitrina o monumento y haz clic." },
  { para: "pc",     icono: "fa-map",             titulo: "Mapa",         texto: "Tab abre el mapa grande: toca un lugar para ir directo." },
  { para: "pc",     icono: "fa-chair",           titulo: "Sentarte",     texto: "En el auditorio, acércate a una butaca y pulsa E." },
  { para: "pc",     icono: "fa-circle-question", titulo: "Ayuda",     texto: "H vuelve a mostrar esta guía en cualquier momento." },
  { para: "pc",     icono: "fa-sun",             titulo: "Iluminación",  texto: "1 Día · 2 Atardecer · 3 Noche. M activa o silencia el sonido." },
  { para: "tactil", icono: "fa-gamepad",         titulo: "Caminar",      texto: "Usa el joystick de la esquina izquierda." },
  { para: "tactil", icono: "fa-hand",            titulo: "Mirar",        texto: "Arrastra el dedo por la pantalla." },
  { para: "tactil", icono: "fa-hand-pointer",    titulo: "Ver información", texto: "Toca un mural, vitrina o monumento." },
  { para: "tactil", icono: "fa-map",             titulo: "Mapa",         texto: "Toca el botón Mapa y elige un lugar para ir directo." },
  { para: "tactil", icono: "fa-chair",           titulo: "Sentarte",     texto: "En el auditorio, acércate a una butaca y toca Sentarse." },
  { para: "tactil", icono: "fa-sun",             titulo: "Iluminación",  texto: "Cambia entre Día, Atardecer y Noche con los botones de arriba." }
];

/* ------------------------------------------------------------
   CONSEJOS que giran en la pantalla de carga
   ------------------------------------------------------------ */
export const CONSEJOS = [
  "Presiona 1, 2 o 3 para cambiar la iluminación",
  "Acércate a un mural o vitrina y haz clic para ver su historia",
  "Abre el mapa con Tab y viaja a cualquier lugar",
  "En el auditorio puedes sentarte con la tecla E",
  "Visita las fuentes de noche para ver su resplandor",
  "Haz clic en la pantalla del auditorio para pausar el video"
];