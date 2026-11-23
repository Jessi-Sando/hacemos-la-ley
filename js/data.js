/* =====================================================================
   HACEMOS LA LEY — Contenidos de la experiencia
   ---------------------------------------------------------------------
   Todo el contenido narrativo vive en este archivo (en lugar de JSON
   cargados con fetch) para que el sitio funcione también abriendo
   index.html directamente, sin servidor.
   Convención: real:true  = fuente institucional/normativa real (resumen)
               real:false = material FICTICIO creado para la simulación
   ===================================================================== */
window.HLL = window.HLL || {};

HLL.DATA = {

  /* ------------------------------------------------------------------ */
  steps: [
    { id: 'bienvenida',  n: 1, label: 'Bienvenida' },
    { id: 'rol',         n: 2, label: 'Elegí tu rol' },
    { id: 'demanda',     n: 3, label: 'La demanda' },
    { id: 'investigar',  n: 4, label: 'Investigar' },
    { id: 'proyecto',    n: 5, label: 'El proyecto' },
    { id: 'congreso',    n: 6, label: 'Congreso' },
    { id: 'resultado',   n: 7, label: 'Resultado' },
    { id: 'laboratorio', n: 8, label: 'Laboratorio' }
  ],

  /* ------------------------------------------------------------------ */
  roles: {
    diputado: {
      name: 'Diputado/a', short: 'Diputada/o', icon: 'banca', color: '#27649A',
      who: 'Ocupás una banca en la Cámara de Diputados (personaje ficticio). Representás al pueblo de tu distrito y integrás la Comisión de Educación.',
      interests: 'Que el programa sea útil para las escuelas y que consiga los votos necesarios para avanzar.',
      info: 'Antecedentes legislativos y demandas ciudadanas que llegaron a tu despacho.',
      responsibilities: ['Estudiar el proyecto y sus antecedentes', 'Proponer y fundamentar modificaciones al articulado', 'Decidir en comisión y firmar un dictamen', 'Votar en el recinto de Diputados'],
      mission: 'Defender, fundamentar y modificar artículos del proyecto.',
      product: 'Propuesta de articulado',
      canVoteIn: 'diputados'
    },
    senador: {
      name: 'Senador/a', short: 'Senadora/or', icon: 'federal', color: '#1F7A6B',
      who: 'Ocupás una banca en el Senado en representación de una provincia (personaje ficticio). Integrás la Comisión de Educación y Cultura del Senado.',
      interests: 'Que el programa pueda aplicarse en todas las provincias, también en escuelas rurales y con poca conectividad.',
      info: 'Perspectivas federales y dificultades de implementación que te acercan autoridades provinciales.',
      responsibilities: ['Seguir el tratamiento en la cámara de origen', 'Revisar el proyecto cuando llegue al Senado', 'Proponer modificaciones desde una mirada federal', 'Votar en el recinto del Senado'],
      mission: 'Revisar el proyecto desde las responsabilidades y necesidades de distintas jurisdicciones.',
      product: 'Propuesta de modificaciones',
      canVoteIn: 'senado'
    },
    organizacion: {
      name: 'Organización social', short: 'Organización', icon: 'megafono', color: '#B5542C',
      who: 'Coordinás una organización ficticia, la Red «Nadie Se Banca Solo», que acompaña a jóvenes que atravesaron situaciones de acoso digital.',
      interests: 'Que las voces de quienes sufren acoso sean escuchadas y que la ley incluya acompañamiento real.',
      info: 'Testimonios, demandas y experiencias que la red reunió con estudiantes.',
      responsibilities: ['Reunir y cuidar testimonios', 'Representar necesidades ciudadanas', 'Presentar recomendaciones a la comisión', 'Seguir el debate y comunicarlo a la comunidad'],
      mission: 'Representar necesidades ciudadanas y presentar recomendaciones.',
      product: 'Documento de demandas',
      canVoteIn: null
    },
    periodista: {
      name: 'Periodista', short: 'Periodista', icon: 'micro', color: '#6A4C93',
      who: 'Trabajás en «El Eco Federal», un medio ficticio. Cubrís educación y política.',
      interests: 'Que la comunidad entienda qué se discute, quién propone qué y por qué.',
      info: 'Publicaciones, testimonios y fuentes contrapuestas que tenés que verificar.',
      responsibilities: ['Investigar y contrastar fuentes', 'Distinguir hechos, opiniones y propuestas', 'Formular preguntas a los actores', 'Producir una cobertura clara y equilibrada'],
      mission: 'Investigar, contrastar y comunicar el conflicto.',
      product: 'Noticia o cobertura periodística',
      canVoteIn: null
    },
    asesor: {
      name: 'Asesor/a legislativo/a', short: 'Asesora/or', icon: 'lupa', color: '#8A6D1F',
      who: 'Trabajás en el equipo técnico de un despacho legislativo (personaje ficticio). No votás: analizás y recomendás.',
      interests: 'Que el proyecto sea jurídicamente consistente, financiable y aplicable.',
      info: 'Antecedentes jurídicos, competencias institucionales y problemas de implementación.',
      responsibilities: ['Analizar la viabilidad jurídica', 'Revisar competencias de Nación y provincias', 'Señalar necesidades de financiamiento', 'Elaborar recomendaciones técnicas'],
      mission: 'Analizar la viabilidad de la propuesta y formular recomendaciones.',
      product: 'Informe técnico',
      canVoteIn: null
    }
  },

  /* ------------------------------------------------------------------ */
  /* Pantalla 3 — problemas que el estudiante puede priorizar           */
  problems: [
    { id: 'p1', label: 'Las escuelas no tienen protocolos claros para actuar' },
    { id: 'p2', label: 'Docentes y equipos directivos sin capacitación específica' },
    { id: 'p3', label: 'Falta de orientación y acompañamiento a quienes sufren acoso' },
    { id: 'p4', label: 'Circulación de imágenes y mensajes sin consentimiento' },
    { id: 'p5', label: 'Miedo a contar lo que pasa / no saber a quién recurrir' },
    { id: 'p6', label: 'Diferencias de recursos y conectividad entre escuelas y provincias' },
    { id: 'p7', label: 'Riesgo de que la «prevención» invada la privacidad de estudiantes' },
    { id: 'p8', label: 'Poco diálogo con las familias' }
  ],

  /* Pantalla 3 — feed de la red social ficticia «Ágora» */
  feed: [
    {
      id: 'f1', kind: 'campaña', author: 'Valentina Ríos', handle: '@vale.rios', tag: 'Campaña juvenil',
      time: 'hace 3 días', avatar: 'VR', roles: ['organizacion', 'diputado'],
      text: '«No alcanza con pedirles a los estudiantes que se cuiden. Necesitamos que las escuelas tengan herramientas, capacitación y acompañamiento. Queremos que esto deje de depender de la buena voluntad de cada institución». Arrancamos #NadieSeBancaSolo 💛',
      reveals: ['p1', 'p2', 'p3'],
      comments: [
        { a: 'Tomi B.', t: 'En mi escuela nadie sabía qué hacer cuando pasó lo del grupo. Firmo.' },
        { a: 'Profe Lau', t: 'Como docente: queremos ayudar, pero nos faltan herramientas.' }
      ]
    },
    {
      id: 'f2', kind: 'campaña', author: 'Red Nadie Se Banca Solo', handle: '@nadiesebancasolo', tag: 'Campaña juvenil',
      time: 'hace 2 días', avatar: 'NS', roles: ['organizacion', 'periodista'],
      text: 'Estamos juntando testimonios (anónimos, cuidando a quien los cuenta) para llevarlos a quienes pueden presentar un proyecto de ley. Una demanda no es todavía una ley: necesitamos que alguien con iniciativa legislativa la tome.',
      reveals: ['p5'],
      comments: [
        { a: 'Sofi', t: '¿Y si nadie del Congreso lo toma?' },
        { a: 'Red Nadie Se Banca Solo', t: 'Por eso hablamos con legisladores de distintos bloques y con medios.' }
      ]
    },
    {
      id: 'f3', kind: 'testimonio', author: 'Mía, 15 años', handle: 'testimonio anónimo', tag: 'Testimonio',
      time: 'hace 2 días', avatar: 'M', roles: ['organizacion', 'periodista', 'asesor'],
      text: 'Alguien editó una foto mía y la pasó por el grupo del curso. En la escuela me dijeron que «era algo de afuera» y que no podían hacer nada. Lo peor fue sentir que no tenía a quién contarle.',
      reveals: ['p4', 'p5', 'p1'], comments: []
    },
    {
      id: 'f4', kind: 'testimonio', author: 'Joaquín, 17 años', handle: 'testimonio anónimo', tag: 'Testimonio',
      time: 'ayer', avatar: 'J', roles: ['organizacion', 'senador'],
      text: 'Vivo en un pueblo chico. La escuela tiene internet a veces y no hay psicóloga. Una profe quiso ayudarme, pero me dijo que no sabía cómo. Cuando hablan de «capacitaciones online» pienso: ¿acá cómo?',
      reveals: ['p6', 'p2', 'p3'], comments: []
    },
    {
      id: 'f5', kind: 'noticia', author: 'El Eco Federal', handle: 'medio ficticio', tag: 'Noticia',
      time: 'hoy', avatar: 'EF', roles: ['periodista', 'diputado', 'asesor'],
      title: 'Una campaña estudiantil llega al Congreso: un diputado anuncia un proyecto',
      text: 'El diputado Ramiro Acosta (personaje ficticio) anunció que presentará un proyecto para crear un programa nacional de prevención y acompañamiento frente a la violencia digital en las escuelas. «Recogemos una demanda que nos trajeron los propios estudiantes», dijo. Desde otros bloques advierten que «ya existen normas sobre convivencia escolar» y preguntan cómo se financiaría.',
      reveals: ['p1'], comments: []
    },
    {
      id: 'f6', kind: 'critica', author: 'Gustavo, papá', handle: '@gusta_papa', tag: 'Reacción crítica',
      time: 'hoy', avatar: 'G', roles: ['asesor', 'diputado', 'senador'],
      text: '¿Otra ley más? Ya hay leyes de convivencia escolar. Lo que falta es plata, gente en las escuelas y que las familias estemos al tanto. Una ley sin presupuesto es un cartel lindo.',
      reveals: ['p8'],
      comments: [{ a: 'Vale Ríos', t: 'Justamente por eso pedimos un programa con recursos, no solo un cartel.' }]
    },
    {
      id: 'f7', kind: 'critica', author: 'Lucas, 16 años', handle: '@lucas.16', tag: 'Reacción crítica',
      time: 'hoy', avatar: 'L', roles: ['periodista', 'organizacion', 'asesor'],
      text: 'Ojo: que «prevención» no termine siendo que nos revisen el celular. Estoy de acuerdo con que haya ayuda, no con que nos vigilen.',
      reveals: ['p7'], comments: [{ a: 'Mili', t: 'Totalmente. Cuidar no es controlar.' }]
    }
  ],
  feedQuestion: '¿Qué aspectos del problema deberían ser considerados en una respuesta pública? ¿Cuáles podría resolver una ley y cuáles no?',

  /* ------------------------------------------------------------------ */
  /* Pantalla 4 — dossier de investigación                               */
  sources: [
    /* ---- Fuentes institucionales reales (resúmenes) ---- */
    { id: 'cn77', type: 'institucional', real: true, title: 'Constitución Nacional, artículos 77 a 84',
      origin: 'Constitución de la Nación Argentina (texto 1994)',
      body: 'Regulan la formación y sanción de las leyes. Las leyes pueden iniciarse en cualquiera de las dos cámaras por proyectos de sus miembros o del Poder Ejecutivo, salvo excepciones (art. 77). Aprobado por la cámara de origen, pasa a la revisora; aprobado por ambas, pasa al Poder Ejecutivo, que puede promulgarlo (art. 78). Se considera aprobado por el Ejecutivo el proyecto no vetado en diez días útiles (art. 80). Si la cámara revisora introduce cambios, el proyecto vuelve a la de origen, que puede aceptarlos o insistir en su redacción según las mayorías que establece el art. 81. Se excluye la sanción tácita (art. 82). Si el Ejecutivo veta, el Congreso puede insistir con dos tercios en ambas cámaras (art. 83).',
      link: { href: 'https://www.argentina.gob.ar/normativa', label: 'Consultar en argentina.gob.ar/normativa' },
      roles: ['diputado', 'senador', 'asesor'] },
    { id: 'cn39', type: 'institucional', real: true, title: 'Constitución Nacional, artículo 39 (iniciativa popular)',
      origin: 'Constitución de la Nación Argentina (texto 1994)',
      body: 'La ciudadanía tiene derecho de iniciativa para presentar proyectos de ley en la Cámara de Diputados, que el Congreso debe tratar dentro de los doce meses. Una ley reglamenta los requisitos. No pueden ser objeto de iniciativa popular la reforma constitucional, los tratados internacionales, los tributos, el presupuesto y la materia penal. En esta simulación, la demanda llega al Congreso por otro camino: un diputado la toma y presenta el proyecto.',
      link: { href: 'https://www.argentina.gob.ar/normativa', label: 'Consultar en argentina.gob.ar/normativa' },
      roles: ['organizacion', 'periodista', 'asesor'] },
    { id: 'l26892', type: 'antecedente', real: true, title: 'Ley 26.892 (2013) — Convivencia en instituciones educativas',
      origin: 'Ley nacional',
      body: 'Establece bases para la promoción de la convivencia y el abordaje de la conflictividad social en las instituciones educativas. Es un antecedente directo: cualquier programa nuevo debería articularse con ella para no superponerse.',
      link: { href: 'https://www.argentina.gob.ar/normativa', label: 'Buscar «Ley 26.892»' },
      roles: ['diputado', 'asesor', 'periodista'] },
    { id: 'l27590', type: 'antecedente', real: true, title: 'Ley 27.590 (2020) — «Ley Mica Ortega»',
      origin: 'Ley nacional',
      body: 'Crea el Programa Nacional de Prevención y Concientización del Grooming o Ciberacoso contra Niñas, Niños y Adolescentes. Muestra que ya existe una política nacional sobre un tipo de violencia digital (el acoso de adultos a menores); el proyecto de la simulación apunta a la violencia digital entre pares en ámbitos educativos.',
      link: { href: 'https://www.argentina.gob.ar/normativa', label: 'Buscar «Ley 27.590»' },
      roles: ['diputado', 'asesor', 'organizacion'] },
    { id: 'l26206', type: 'institucional', real: true, title: 'Ley 26.206 (2006) — Educación Nacional y Consejo Federal',
      origin: 'Ley nacional',
      body: 'Organiza el sistema educativo nacional. Las provincias y la Ciudad de Buenos Aires tienen a su cargo la gestión de sus sistemas educativos, junto con responsabilidades del Estado nacional. La ley establece el Consejo Federal de Educación como ámbito de concertación de la política educativa entre Nación y jurisdicciones.',
      link: { href: 'https://www.argentina.gob.ar/normativa', label: 'Buscar «Ley 26.206»' },
      roles: ['senador', 'asesor'] },
    { id: 'l26061', type: 'institucional', real: true, title: 'Ley 26.061 (2005) — Protección integral de niñas, niños y adolescentes',
      origin: 'Ley nacional',
      body: 'Reconoce a niñas, niños y adolescentes como sujetos de derechos, entre ellos el derecho a opinar y a ser oídos y el principio del interés superior. Sirve para fundamentar la participación de estudiantes en el diseño del programa.',
      link: { href: 'https://www.argentina.gob.ar/normativa', label: 'Buscar «Ley 26.061»' },
      roles: ['organizacion', 'diputado'] },
    { id: 'l25326', type: 'institucional', real: true, title: 'Ley 25.326 (2000) — Protección de datos personales',
      origin: 'Ley nacional',
      body: 'Regula el tratamiento de datos personales y los derechos de sus titulares. Es clave para discutir cualquier medida que implique registrar o supervisar comunicaciones de estudiantes.',
      link: { href: 'https://www.argentina.gob.ar/normativa', label: 'Buscar «Ley 25.326»' },
      roles: ['asesor', 'periodista', 'organizacion'] },
    { id: 'l24156', type: 'institucional', real: true, title: 'Ley 24.156 — Administración financiera (art. 38)',
      origin: 'Ley nacional · verificar texto vigente',
      body: 'Establece que toda ley que autorice gastos no previstos en el presupuesto general debe especificar las fuentes de los recursos para su financiamiento. Plantea la pregunta: ¿cómo se paga el programa?',
      link: { href: 'https://www.argentina.gob.ar/normativa', label: 'Buscar «Ley 24.156»' },
      roles: ['asesor', 'senador'] },

    /* ---- Materiales ficticios ---- */
    { id: 'e1', type: 'especialista', real: false, title: 'Entrevista a una psicóloga escolar',
      origin: 'Lic. Carla Medina — personaje ficticio',
      body: '«Lo que más ayuda es que el chico o la chica sepa a quién recurrir y que el adulto que escucha no minimice. Los protocolos sirven si alguien está formado para aplicarlos. Las campañas sueltas, sin seguimiento, suelen quedarse cortas».',
      roles: ['organizacion', 'diputado'] },
    { id: 'e2', type: 'especialista', real: false, title: 'Columna: «Cuidar no es vigilar»',
      origin: 'Dra. Inés Paredes, abogada en derechos digitales — personaje ficticio',
      body: '«Supervisar los dispositivos personales de estudiantes puede chocar con su intimidad y con la protección de datos. Una política de prevención debería apoyarse en la educación, la confianza y canales seguros para pedir ayuda».',
      roles: ['asesor', 'periodista', 'organizacion'] },
    { id: 'c1', type: 'perspectiva', real: false, title: 'Opinión: «No hace falta otra ley»',
      origin: 'Columnista de El Eco Federal — personaje ficticio',
      body: '«Ya hay normas de convivencia escolar y un programa contra el grooming. Sumar leyes no resuelve nada si no se aplican las existentes. Mejor fortalecer lo que hay».',
      roles: ['periodista', 'diputado', 'asesor'] },
    { id: 'c2', type: 'perspectiva', real: false, title: '«¿Quién paga y quién aplica?»',
      origin: 'Ministra de Educación de una provincia — personaje ficticio',
      body: '«Las escuelas las gestionamos las provincias. Si Nación crea un programa, tiene que acordarlo con nosotras y traer recursos. Si no, es una obligación más sin con qué cumplirla».',
      roles: ['senador', 'asesor'] },
    { id: 't1', type: 'testimonio', real: false, title: 'Testimonio de un docente rural',
      origin: 'Prof. Andrés Quiroga — personaje ficticio',
      body: '«Tengo alumnos que viajan una hora para llegar. El acoso digital también llega acá, aunque la conexión sea mala. Necesito formación presencial y un equipo al que llamar cuando no sé qué hacer».',
      roles: ['senador', 'organizacion'] },
    { id: 't2', type: 'testimonio', real: false, title: 'Testimonio de una madre',
      origin: 'Claudia, madre de un estudiante — personaje ficticio',
      body: '«Me enteré tarde de lo que le pasaba a mi hijo. Nadie de la escuela nos avisó y yo no sabía cómo preguntarle. Las familias también necesitamos orientación».',
      roles: ['organizacion', 'diputado', 'periodista'] },

    /* ---- Podcast «Voces del debate» (ficticio) ---- */
    { id: 'pod1', type: 'podcast', real: false, title: 'Voces del debate · Ep. 1 «Lo que pasa en el grupo»',
      origin: 'Podcast ficticio — transcripción', audio: null,
      transcript: [
        ['Conductora', 'Hoy hablamos con estudiantes. ¿Dónde empieza el acoso digital?'],
        ['Valentina (17)', 'Muchas veces en el grupo del curso. Una captura, un sticker con tu cara, y de golpe se ríen todos.'],
        ['Tomás (16)', 'Y el que comparte piensa que es un chiste. Por eso pedimos que se hable en clase, no solo cuando ya explotó.'],
        ['Conductora', '¿Qué le pedirían a una ley?'],
        ['Valentina (17)', 'Que haya alguien formado en cada escuela y que nos pregunten a nosotros cómo hacerlo.']
      ],
      roles: ['organizacion', 'periodista', 'diputado'] },
    { id: 'pod2', type: 'podcast', real: false, title: 'Voces del debate · Ep. 2 «La escuela no estaba preparada»',
      origin: 'Podcast ficticio — transcripción', audio: null,
      transcript: [
        ['Conductora', 'Una orientadora escolar y una directora nos cuentan qué pasa del otro lado.'],
        ['Orientadora', 'Cuando llega un caso, lo primero es escuchar y no exponer a nadie. Pero cada escuela inventa su protocolo.'],
        ['Directora', 'Y si el hecho pasó un domingo en un chat, ¿es asunto de la escuela? Nosotros creemos que sí, porque afecta la convivencia del lunes.'],
        ['Orientadora', 'Lo que no puede pasar es que la respuesta sea controlar celulares. Eso rompe la confianza.']
      ],
      roles: ['asesor', 'organizacion', 'diputado'] },
    { id: 'pod3', type: 'podcast', real: false, title: 'Voces del debate · Ep. 3 «¿Una ley para todo el país?»',
      origin: 'Podcast ficticio — transcripción', audio: null,
      transcript: [
        ['Conductor', '¿Puede un programa nacional funcionar igual en una gran ciudad y en un paraje rural?'],
        ['Ministra provincial', 'Igual, no. Necesitamos acordar cómo se aplica en cada provincia, y eso se discute en el Consejo Federal de Educación.'],
        ['Especialista', 'Y hay que decir con qué recursos. Un programa sin financiamiento queda en buenas intenciones.'],
        ['Conductor', 'O sea que la discusión no es solo si el problema existe, sino cómo se responde.']
      ],
      roles: ['senador', 'asesor', 'periodista'] }
  ],

  /* Información exclusiva por rol */
  exclusive: {
    diputado: { title: 'Memo del bloque (ficticio): cómo conseguir apoyos',
      body: 'En la comisión hay tres posiciones: quienes apoyan el proyecto tal como está, quienes exigen saber cómo se financia y quienes temen que se superponga con las leyes 26.892 y 27.590. Si el proyecto aclara financiamiento y articulación con normas existentes, crece la posibilidad de un dictamen amplio.' },
    senador: { title: 'Carta de autoridades educativas de tres provincias (ficticia)',
      body: '«Solicitamos que cualquier programa nacional se implemente de manera concertada con las jurisdicciones, contemple escuelas rurales y de baja conectividad, y prevea recursos. Sin acuerdo federal, la aplicación será desigual».' },
    organizacion: { title: 'Mapa de demandas de la Red (ficticio)',
      body: 'De las conversaciones con estudiantes surgen cuatro pedidos que se repiten: saber a quién recurrir, que los adultos estén formados, que no se exponga a quien cuenta lo que le pasa y que la prevención no se convierta en vigilancia. (Síntesis cualitativa, sin datos estadísticos).' },
    periodista: { title: 'Libreta de fuentes: contradicciones a verificar',
      body: 'El autor del proyecto (ficticio) dijo en un programa de radio que «el programa no tiene costo». Una asesora técnica (ficticia) te dijo off the record que «sin partidas específicas no hay capacitaciones». ¿Quién tiene razón? Revisá qué dice el proyecto sobre financiamiento.' },
    asesor: { title: 'Ficha técnica interna (ficticia)',
      body: 'Puntos críticos: 1) competencias concurrentes Nación–provincias en educación (Ley 26.206); 2) el proyecto no indica fuente de financiamiento (ver Ley 24.156, art. 38); 3) cualquier supervisión de comunicaciones debe evaluarse frente a la Ley 25.326 y al derecho a la intimidad; 4) riesgo de superposición con la Ley 26.892.' }
  },

  /* ------------------------------------------------------------------ */
  /* Pantalla 5 — proyecto de ley ficticio                               */
  bill: {
    title: 'Programa Nacional de Prevención y Acompañamiento frente a la Violencia Digital en Ámbitos Educativos',
    expediente: 'Expte. HLL-0001-D-2026 (ficticio)',
    author: 'Dip. Ramiro Acosta (personaje ficticio)',
    formula: 'El Senado y Cámara de Diputados de la Nación Argentina, reunidos en Congreso, etc., sancionan con fuerza de Ley:',
    fundamentos: 'Este proyecto recoge una demanda impulsada por estudiantes secundarios de distintas provincias, que visibilizaron situaciones de violencia y acoso digital y la falta de herramientas en las escuelas para prevenirlas y acompañar a quienes las atraviesan. Se propone crear un programa nacional que promueva la prevención, la capacitación de las comunidades educativas y mecanismos de orientación y acompañamiento.',
    articles: [
      { n: 1, title: 'Creación', text: 'Créase el Programa Nacional de Prevención y Acompañamiento frente a la Violencia Digital en Ámbitos Educativos, en el ámbito de la autoridad educativa nacional.' },
      { n: 2, title: 'Objetivos', text: 'Son objetivos del Programa: a) prevenir situaciones de violencia y acoso digital entre estudiantes; b) promover el uso respetuoso y responsable de los entornos digitales; c) garantizar orientación y acompañamiento a quienes atraviesan estas situaciones.' },
      { n: 3, title: 'Capacitación y prevención', text: 'La autoridad de aplicación promoverá instancias de capacitación destinadas a docentes, equipos directivos, estudiantes y familias, y desarrollará materiales de prevención.' },
      { n: 4, title: 'Orientación y acompañamiento', text: 'Se establecerán mecanismos de orientación y acompañamiento para las personas afectadas y protocolos de actuación para las instituciones educativas.' },
      { n: 5, title: 'De forma', text: 'Comuníquese al Poder Ejecutivo nacional.' }
    ]
  },

  /* Puntos de negociación — determinan los escenarios                  */
  issues: {
    fin: {
      label: 'Financiamiento',
      q: '¿Cómo se financia el programa?',
      A: { label: 'Prever partidas en la ley de presupuesto', art: { title: 'Financiamiento', text: 'Los gastos que demande la presente ley se atenderán con las partidas que anualmente asigne la ley de presupuesto a la autoridad de aplicación.' } },
      B: { label: 'No especificar financiamiento', art: null }
    },
    fed: {
      label: 'Federalismo',
      q: '¿Cómo se aplica en las provincias?',
      A: { label: 'Implementación concertada en el Consejo Federal de Educación', art: { title: 'Coordinación federal', text: 'La implementación del Programa se acordará con las jurisdicciones en el ámbito del Consejo Federal de Educación, contemplando escuelas rurales y de baja conectividad.' } },
      B: { label: 'Aplicación directa por la Nación en todas las escuelas', art: { title: 'Aplicación', text: 'La autoridad de aplicación nacional ejecutará el Programa en todos los establecimientos educativos del país.' } }
    },
    dat: {
      label: 'Privacidad',
      q: '¿Cómo se previenen los casos?',
      A: { label: 'Educación, canales de ayuda y protección de datos', art: { title: 'Protección de datos y participación', text: 'Las acciones del Programa respetarán la Ley 25.326 de Protección de Datos Personales, no implicarán la supervisión de dispositivos personales y contarán con la participación de estudiantes en su diseño.' } },
      B: { label: 'Supervisión de comunicaciones de estudiantes', art: { title: 'Supervisión', text: 'Las instituciones educativas podrán implementar sistemas de supervisión de las comunicaciones digitales de estudiantes, incluidos sus dispositivos personales, cuando lo consideren necesario para prevenir situaciones de violencia.' } }
    }
  },

  /* ------------------------------------------------------------------ */
  /* Pantalla 6 — personajes ficticios del Congreso                      */
  legislators: {
    diputados: [
      { name: 'Dip. Ramiro Acosta', bloc: 'Frente Ciudadano (ficticio)', stance: 'Autor', fin: 'A', fed: 'B', dat: 'A',
        quote: 'Este proyecto nace de los estudiantes. No podemos responderles con indiferencia: cada escuela tiene que saber qué hacer.' },
      { name: 'Dip. Marta Sosa', bloc: 'Preside la Comisión de Educación (ficticia)', stance: 'Condicional', fin: 'A', fed: 'A', dat: 'A',
        quote: 'Acompaño la idea, pero quiero ver con qué recursos y cómo se acuerda con las provincias. Sin eso, firmo en disidencia.' },
      { name: 'Dip. Federico Lund', bloc: 'Alianza Renovación (ficticio)', stance: 'En contra', fin: 'B', fed: 'B', dat: 'B',
        quote: 'Ya existen la Ley 26.892 y la 27.590. Si igual se aprueba, que las escuelas puedan controlar lo que circula.' },
      { name: 'Dip. Noelia Gauna', bloc: 'Bloque Federal Joven (ficticio)', stance: 'A favor con cambios', fin: 'A', fed: 'A', dat: 'A',
        quote: 'No voy a votar nada que habilite revisar celulares de adolescentes. Prevenir es educar, no vigilar.' }
    ],
    senado: [
      { name: 'Sen. Héctor Villalba', bloc: 'Por una provincia del NOA (ficticio)', stance: 'Federalista',
        quote: 'En mi provincia hay escuelas sin conexión estable. Si no se acuerda con las provincias, esta ley no llega.' },
      { name: 'Sen. Laura Brizuela', bloc: 'Por una provincia patagónica (ficticio)', stance: 'A favor',
        quote: 'El problema es real y nacional. Mejoremos el texto, pero no lo frenemos.' },
      { name: 'Sen. Ezequiel Moreno', bloc: 'Por una provincia del centro (ficticio)', stance: 'Fiscalista',
        quote: '¿Cuánto cuesta y de dónde sale? Sin esa respuesta, no hay programa.' }
    ]
  },

  /* ------------------------------------------------------------------ */
  glossary: [
    ['Demanda ciudadana', 'Pedido que la ciudadanía u organizaciones hacen visible para que un problema se trate públicamente. No es todavía un proyecto de ley.'],
    ['Iniciativa legislativa', 'Facultad de presentar formalmente un proyecto de ley. Según la Constitución, la tienen los miembros de cada cámara y el Poder Ejecutivo (art. 77) y, con requisitos, la ciudadanía en Diputados (art. 39).'],
    ['Comisión', 'Grupo de legisladores que estudia los proyectos según su tema antes de que se traten en el recinto.'],
    ['Dictamen', 'Opinión escrita de una comisión sobre un proyecto. Puede haber dictamen de mayoría y de minoría.'],
    ['Cámara de origen', 'La cámara donde se presentó y se trató primero el proyecto.'],
    ['Cámara revisora', 'La segunda cámara, que puede aprobar, rechazar o modificar lo que recibió.'],
    ['Media sanción', 'Expresión habitual para indicar que un proyecto fue aprobado por una sola de las cámaras.'],
    ['Sanción', 'Aprobación del proyecto por ambas cámaras del Congreso.'],
    ['Promulgación', 'Acto del Poder Ejecutivo que aprueba la ley sancionada. Si no la veta en diez días útiles, queda promulgada automáticamente (art. 80).'],
    ['Veto', 'Rechazo total o parcial del Poder Ejecutivo a un proyecto sancionado. El Congreso puede insistir con dos tercios en ambas cámaras (art. 83).'],
    ['Quórum', 'Cantidad mínima de legisladores presentes para sesionar: la mayoría absoluta de los miembros (art. 64).']
  ],

  /* Simplificaciones didácticas declaradas */
  simplifications: [
    'Se muestran solo dos comisiones por cámara y una única reunión de comisión.',
    'La votación en general y en particular se presenta como una sola instancia.',
    'Los resultados de las votaciones son escenarios programados, no estadísticas reales.',
    'El cómputo de abstenciones y algunos plazos reglamentarios dependen de los reglamentos de cada cámara: quedan pendientes de revisión docente.',
    'La promulgación parcial (art. 80) tiene requisitos que la simulación resume y no desarrolla.',
    'Organizaciones, periodistas y asesores no votan: en la simulación, sus recomendaciones influyen porque legisladores ficticios las retoman.'
  ]
};
