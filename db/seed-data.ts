export interface DishData {
  name: string;
  description: string;
  ingredients: string;
  price: number;
  category: string;
  allergens: string;
}

export interface BusinessSeedData {
  name: string;
  slug: string;
  description: string;
  businessType: 'restaurant' | 'bar' | 'hotel' | 'service' | 'retail';
  dishes: DishData[];
}

// ── Demo businesses (fictional) ───────────────────────────────────────────
// These are inserted into the `businesses` table with is_demo = true.
// They serve as working examples in the public demo.

export const SEED_DEMO_BUSINESSES: BusinessSeedData[] = [
  // ── 1. El Mesón Austral — Chilean traditional restaurant ──────────────
  {
    name: 'El Mesón Austral',
    slug: 'el-meson-austral',
    description: 'Cocina chilena de raíz con ingredientes del sur. Parrilla a leña, mariscos frescos y recetas de temporada.',
    businessType: 'restaurant',
    dishes: [
      // Entradas
      { name: 'Empanada de pino', description: 'Empanada horneada rellena de carne picada, cebolla, huevo duro, aceituna y pasas', ingredients: 'harina, carne picada de vacuno, cebolla, huevo, aceituna, pasas, merkén', price: 2900, category: 'entradas', allergens: 'gluten, huevo' },
      { name: 'Pastel de jaiba', description: 'Gratín de jaiba con salsa bechamel y queso mantecoso', ingredients: 'jaiba, crema, leche, queso mantecoso, cebolla, ají de color', price: 8900, category: 'entradas', allergens: 'mariscos, lácteos, gluten' },
      { name: 'Sopaipillas pasadas', description: 'Sopaipillas de zapallo en chancaca con canela y naranja', ingredients: 'zapallo, harina, manteca, chancaca, canela, naranja', price: 3500, category: 'entradas', allergens: 'gluten' },
      { name: 'Longanizas chillaneras', description: 'Longanizas a la parrilla con pan amasado y pebre de cilantro', ingredients: 'longaniza de cerdo, ají color, comino, pan amasado, tomate, cilantro, cebolla', price: 7500, category: 'entradas', allergens: 'gluten, cerdo' },
      // Sopas y cazuelas
      { name: 'Cazuela de vacuno', description: 'Caldo sustancioso con osobuco de vacuno, papas, choclo, zapallo y arroz', ingredients: 'osobuco de vacuno, papa, choclo, zapallo, arroz, zanahoria, cilantro', price: 9900, category: 'sopas y cazuelas', allergens: 'ninguno' },
      { name: 'Cazuela de ave', description: 'Muslo de pollo cocido lentamente con verduras de estación y fideos cabello de ángel', ingredients: 'muslo de pollo, papa, choclo, zapallo, fideos cabello de ángel, zanahoria', price: 8900, category: 'sopas y cazuelas', allergens: 'gluten' },
      { name: 'Charquicán', description: 'Guiso chileno de charqui, zapallo, papas y porotos', ingredients: 'charqui de vacuno, zapallo, papa, porotos verdes, choclo, cebolla, merkén', price: 9500, category: 'sopas y cazuelas', allergens: 'ninguno' },
      // Carnes a la parrilla
      { name: 'Asado de tira', description: 'Corte clásico al carbón servido con ensalada chilena y papas doradas', ingredients: 'asado de tira de vacuno, sal parrillera, papa, tomate, cebolla, cilantro', price: 14900, category: 'carnes a la parrilla', allergens: 'ninguno' },
      { name: 'Entraña a la parrilla', description: 'Entraña de vacuno con chimichurri austral y puré rústico de papas', ingredients: 'entraña de vacuno, perejil, ajo, ají cacho de cabra, vinagre de vino, papa', price: 16900, category: 'carnes a la parrilla', allergens: 'ninguno' },
      { name: 'Lomo vetado', description: 'Lomo vetado al punto con salsa de hongos de pino y arroz cremoso', ingredients: 'lomo vetado de vacuno, hongos de pino, crema, cebolla, vino tinto, arroz', price: 18900, category: 'carnes a la parrilla', allergens: 'lácteos' },
      { name: 'Costillar de cerdo BBQ', description: 'Costillar lentamente ahumado con salsa criolla y choclo asado', ingredients: 'costillar de cerdo, salsa BBQ, ají de color, comino, choclo, cebolla, tomate', price: 15900, category: 'carnes a la parrilla', allergens: 'gluten' },
      // Pescados y mariscos
      { name: 'Reineta frita', description: 'Reineta entera frita en tempura liviana con ensalada de pepino y limón', ingredients: 'reineta, harina, huevo, agua con gas, pepino, limón, sal', price: 13500, category: 'pescados y mariscos', allergens: 'pescado, gluten, huevo' },
      { name: 'Congrio al vapor', description: 'Congrio colorado cocido al vapor con mantequilla de algas y papas crecidas', ingredients: 'congrio colorado, mantequilla, cochayuyo, papa, limón, perejil', price: 15900, category: 'pescados y mariscos', allergens: 'pescado, lácteos' },
      { name: 'Mariscal caliente', description: 'Caldo de mariscos con almejas, choritos, machas y erizo de la zona', ingredients: 'almejas, choritos, machas, erizo, cebolla, ajo, vino blanco, cilantro', price: 16900, category: 'pescados y mariscos', allergens: 'mariscos' },
      { name: 'Chupe de mariscos', description: 'Gratín de mariscos mixtos con bechamel de queso mantecoso y pan de campo', ingredients: 'mariscos mixtos, leche, crema, queso mantecoso, pan de campo, cebolla, ají de color', price: 14500, category: 'pescados y mariscos', allergens: 'mariscos, lácteos, gluten' },
      // Postres
      { name: 'Leche asada', description: 'Postre clásico chileno de leche horneada con caramelo de naranja', ingredients: 'leche, huevo, azúcar, vainilla, caramelo de naranja', price: 4500, category: 'postres', allergens: 'lácteos, huevo' },
      { name: 'Torta de milhojas', description: 'Milhojas de hojarasca con manjar y crema chantilly', ingredients: 'hojarasca, manjar, crema chantilly, azúcar flor', price: 5500, category: 'postres', allergens: 'gluten, lácteos, huevo' },
      { name: 'Mote con huesillo', description: 'Bebida y postre chileno con durazno deshidratado y mote de trigo', ingredients: 'huesillos de durazno, mote de trigo, azúcar, canela, clavo de olor', price: 3500, category: 'postres', allergens: 'gluten' },
      // Bebidas
      { name: 'Pisco sour artesanal', description: 'Pisco des Andes con jugo de limón de pica, jarabe de miel y clara de huevo', ingredients: 'pisco, limón de pica, jarabe de miel, clara de huevo, hielo', price: 5900, category: 'bebidas', allergens: 'huevo' },
      { name: 'Terremoto', description: 'Vino pipeño con helado de piña y granadina', ingredients: 'vino pipeño, helado de piña, granadina, fernet', price: 4900, category: 'bebidas', allergens: 'lácteos' },
      { name: 'Vino de la casa (copa)', description: 'Carménère o Chardonnay de viñas del Maule', ingredients: 'vino tinto carménère o vino blanco chardonnay', price: 3900, category: 'bebidas', allergens: 'ninguno' },
      { name: 'Agua de hierbas', description: 'Infusión fría de menta, boldo y cedrón de cosecha propia', ingredients: 'menta, boldo, cedrón, agua, miel', price: 2500, category: 'bebidas', allergens: 'ninguno' },
    ],
  },

  // ── 2. Hotel Los Quillayes — boutique mountain hotel ──────────────────
  {
    name: 'Hotel Los Quillayes',
    slug: 'hotel-los-quillayes',
    description: 'Hotel boutique de montaña con cocina de autor. Desayunos gourmet, room service y bar con vista a la cordillera.',
    businessType: 'hotel',
    dishes: [
      // Desayunos
      { name: 'Desayuno continental', description: 'Café o té, jugo natural, pan de masa madre, mantequilla, mermelada artesanal y una fruta de estación', ingredients: 'pan de masa madre, mantequilla, mermelada de frambuesa, fruta de estación, café o té', price: 8900, category: 'desayunos', allergens: 'gluten, lácteos' },
      { name: 'Desayuno americano', description: 'Huevos revueltos, tostadas, tocino ahumado, jugo, fruta y café o té', ingredients: 'huevos, tostadas de pan centeno, tocino, jugo de naranja, fruta, café', price: 12900, category: 'desayunos', allergens: 'gluten, huevo, lácteos' },
      { name: 'Huevos benedictinos', description: 'Muffin inglés con jamón serrano, huevo pochado y salsa holandesa', ingredients: 'muffin inglés, jamón serrano, huevo pochado, mantequilla, yema, limón', price: 14900, category: 'desayunos', allergens: 'gluten, huevo, lácteos' },
      { name: 'Bowl de quínoa', description: 'Quínoa cocida con leche de coco, frutas de temporada, granola y miel de ulmo', ingredients: 'quínoa, leche de coco, mango, arándanos, granola, miel de ulmo', price: 9900, category: 'desayunos', allergens: 'frutos secos, gluten' },
      { name: 'Tostadas de palta y salmón ahumado', description: 'Pan de centeno con palta, salmón ahumado, alcaparras, cebolla morada y eneldo', ingredients: 'pan de centeno, palta, salmón ahumado, alcaparras, cebolla morada, eneldo, limón', price: 13500, category: 'desayunos', allergens: 'gluten, pescado' },
      // Room service
      { name: 'Sopa de cebolla gratinada', description: 'Sopa clásica francesa con caldo de vacuno, crutones y queso gruyère fundido', ingredients: 'cebolla, caldo de vacuno, vino blanco, crutones, queso gruyère, mantequilla', price: 8900, category: 'room service', allergens: 'gluten, lácteos' },
      { name: 'Club sándwich', description: 'Triple de pan de mie tostado con pollo a la plancha, tocino, tomate, lechuga y mayonesa', ingredients: 'pan de mie, pollo, tocino, tomate, lechuga, mayonesa, huevo duro', price: 10900, category: 'room service', allergens: 'gluten, huevo' },
      { name: 'Pasta con pesto de albahaca', description: 'Pasta fresca con pesto genovés, tomates cherry y queso parmesano rallado', ingredients: 'pasta fresca, albahaca, piñones, ajo, aceite de oliva, parmesano, tomates cherry', price: 12900, category: 'room service', allergens: 'gluten, lácteos, frutos secos' },
      { name: 'Filete de vacuno con salsa de pimienta', description: 'Filete al punto con salsa de pimienta verde, puré de papas y espárragos salteados', ingredients: 'filete de vacuno, pimienta verde, crema, cognac, papa, espárragos, mantequilla', price: 22900, category: 'room service', allergens: 'lácteos' },
      { name: 'Tabla de quesos chilenos', description: 'Selección de quesos artesanales del sur: mantecoso, chanco y cabra curado con miel y nueces', ingredients: 'queso mantecoso, queso chanco, queso de cabra curado, miel, nueces, mermelada, galletas', price: 14900, category: 'room service', allergens: 'lácteos, frutos secos, gluten' },
      // Bar del lobby
      { name: 'Negroni', description: 'Gin, vermut rosso y Campari con cáscara de naranja', ingredients: 'gin, vermut rosso, campari, naranja', price: 8500, category: 'bar del lobby', allergens: 'ninguno' },
      { name: 'Whisky sour', description: 'Bourbon, limón, jarabe de azúcar y clara de huevo con bitter de angostura', ingredients: 'bourbon, limón, jarabe, clara de huevo, bitter angostura', price: 8900, category: 'bar del lobby', allergens: 'huevo' },
      { name: 'Kir royale', description: 'Cava brut con licor de cassis', ingredients: 'cava brut, licor de cassis', price: 7500, category: 'bar del lobby', allergens: 'ninguno' },
      { name: 'Agua mineral o con gas', description: 'Agua mineral del sur, formato 500 ml', ingredients: 'agua mineral', price: 2500, category: 'bar del lobby', allergens: 'ninguno' },
      { name: 'Jugos naturales prensados en frío', description: 'Combinación de frutas de estación prensadas en frío: naranja-zanahoria-jengibre o manzana-apio-pepino', ingredients: 'naranja, zanahoria, jengibre o manzana, apio, pepino', price: 5500, category: 'bar del lobby', allergens: 'ninguno' },
      // Minibar
      { name: 'Snack de frutos secos premium', description: 'Mix de nueces, almendras, maní tostado y cranberries deshidratados', ingredients: 'nueces, almendras, maní, cranberries', price: 4500, category: 'minibar', allergens: 'frutos secos' },
      { name: 'Chocolate de origen único', description: 'Tableta de chocolate negro 72% de cacao de origen peruano', ingredients: 'cacao, manteca de cacao, azúcar', price: 4900, category: 'minibar', allergens: 'lácteos' },
      { name: 'Cerveza artesanal local', description: 'Cerveza porter oscura de la cervecería Nuble, formato 330 ml', ingredients: 'agua, malta de cebada, lúpulo, levadura', price: 5500, category: 'minibar', allergens: 'gluten' },
    ],
  },

  // ── 3. Bar El Cóndor — cocktail bar ──────────────────────────────────
  {
    name: 'Bar El Cóndor',
    slug: 'bar-el-condor',
    description: 'Bar de autor en el corazón de la ciudad. Cócteles creativos con destilados chilenos, cartas de temporada y tapas para compartir.',
    businessType: 'bar',
    dishes: [
      // Cócteles de autor
      { name: 'Cóndor Sour', description: 'Pisco artesanal de Elqui, maracuyá, limón de pica, jarabe de hierba buena y clara de huevo', ingredients: 'pisco 40°, maracuyá, limón de pica, jarabe de hierba buena, clara de huevo, hielo', price: 7500, category: 'cócteles de autor', allergens: 'huevo' },
      { name: 'Atacama Mule', description: 'Vodka de uva chilena, jengibre fresco, limón y ginger beer artesanal', ingredients: 'vodka, jengibre fresco, limón, ginger beer artesanal, pepino, menta', price: 7900, category: 'cócteles de autor', allergens: 'ninguno' },
      { name: 'Niebla del Sur', description: 'Gin botánico con té de boldo, pepino, albahaca y tónica de pomelo', ingredients: 'gin botánico, té de boldo, pepino, albahaca fresca, tónica de pomelo, sal de mar', price: 8500, category: 'cócteles de autor', allergens: 'ninguno' },
      { name: 'Desierto Rojo', description: 'Mezcal, Aperol, jugo de pomelo rosado, sal de gusano y pimienta rosa', ingredients: 'mezcal, Aperol, pomelo rosado, sal de gusano, pimienta rosa, hielo', price: 9500, category: 'cócteles de autor', allergens: 'ninguno' },
      { name: 'Lago Azul', description: 'Ginebra premium, licor de butterfly pea flower, jugo de limón y agua tónica', ingredients: 'ginebra, butterfly pea flower, limón, agua tónica, hielo', price: 8900, category: 'cócteles de autor', allergens: 'ninguno' },
      // Cócteles clásicos
      { name: 'Old Fashioned', description: 'Bourbon americano con bitter de angostura, terrón de azúcar y ralladura de naranja', ingredients: 'bourbon, bitter angostura, azúcar, naranja', price: 8900, category: 'cócteles clásicos', allergens: 'ninguno' },
      { name: 'Espresso Martini', description: 'Vodka, licor de café, espresso doble y espuma de vainilla', ingredients: 'vodka, licor de café, espresso, jarabe de vainilla, hielo', price: 8500, category: 'cócteles clásicos', allergens: 'ninguno' },
      { name: 'Aperol Spritz', description: 'Aperol, prosecco y agua con gas, con rodaja de naranja', ingredients: 'aperol, prosecco, agua con gas, naranja', price: 7500, category: 'cócteles clásicos', allergens: 'ninguno' },
      { name: 'Daiquiri de temporada', description: 'Ron blanco, jugo de limón y jarabe de fruta de temporada (consultar al barman)', ingredients: 'ron blanco, limón, jarabe de fruta de temporada, hielo', price: 7900, category: 'cócteles clásicos', allergens: 'ninguno' },
      // Piscos
      { name: 'Pisco Sour clásico', description: 'Pisco 35° con limón de pica, jarabe de goma, clara de huevo y bitter angostura', ingredients: 'pisco 35°, limón de pica, jarabe de goma, clara de huevo, bitter angostura', price: 6500, category: 'piscos', allergens: 'huevo' },
      { name: 'Chilcano Maracuyá', description: 'Pisco con ginger ale, jugo de maracuyá y limón', ingredients: 'pisco, ginger ale, maracuyá, limón, menta', price: 6900, category: 'piscos', allergens: 'ninguno' },
      { name: 'Sour de chicha morada', description: 'Pisco premium con reducción de chicha morada artesanal y espuma de cítricos', ingredients: 'pisco 40°, chicha morada, limón, clara de huevo, canela', price: 7900, category: 'piscos', allergens: 'huevo' },
      // Cervezas artesanales
      { name: 'IPA del Valle', description: 'Cerveza India Pale Ale lupulada, amargor pronunciado con notas cítricas', ingredients: 'agua, malta de cebada, lúpulo cítrico, levadura', price: 5900, category: 'cervezas artesanales', allergens: 'gluten' },
      { name: 'Stout Austral', description: 'Cerveza oscura de cuerpo pesado con notas de café, chocolate y caramelo', ingredients: 'agua, malta tostada, cebada, lúpulo, levadura', price: 5900, category: 'cervezas artesanales', allergens: 'gluten' },
      { name: 'Wheat Ale de frutos', description: 'Cerveza de trigo refrescante con frambuesas y ralladura de limón', ingredients: 'agua, trigo, cebada, lúpulo, levadura, frambuesas, limón', price: 6500, category: 'cervezas artesanales', allergens: 'gluten' },
      // Tapas y snacks
      { name: 'Tabla de fiambres chilenos', description: 'Longaniza de Chillán, jamón de pierna, queso de cabra curado y pepinillos', ingredients: 'longaniza, jamón, queso de cabra, pepinillos, pan amasado', price: 12900, category: 'tapas y snacks', allergens: 'gluten, lácteos, cerdo' },
      { name: 'Tostadas de queso brie con mermelada', description: 'Pan baguette tostado con brie tibio, mermelada de higo y nueces', ingredients: 'baguette, queso brie, mermelada de higo, nueces, miel', price: 9500, category: 'tapas y snacks', allergens: 'gluten, lácteos, frutos secos' },
      { name: 'Papas rústicas con alioli', description: 'Papas en gajos horneadas con piel, sal de mar, romero y alioli de ajo asado', ingredients: 'papas, romero, sal de mar, ajo, aceite de oliva, yema de huevo, limón', price: 7500, category: 'tapas y snacks', allergens: 'huevo' },
      { name: 'Aceitunas marinadas', description: 'Mix de aceitunas negras y verdes con hierbas mediterráneas, ajo y ají cacho de cabra', ingredients: 'aceitunas mixtas, ajo, romero, tomillo, ají cacho de cabra, aceite de oliva', price: 5500, category: 'tapas y snacks', allergens: 'ninguno' },
    ],
  },

  // ── 4. Café Temporada — specialty coffee shop ─────────────────────────
  {
    name: 'Café Temporada',
    slug: 'cafe-temporada',
    description: 'Cafetería de especialidad con granos de origen único, pastelería artesanal y desayunos de autor. Abierto todos los días.',
    businessType: 'service',
    dishes: [
      // Cafés de especialidad
      { name: 'Espresso', description: 'Shot doble de espresso con granos de origen único tostado oscuro', ingredients: 'café de especialidad 100% arábica', price: 2200, category: 'cafés de especialidad', allergens: 'ninguno' },
      { name: 'Flat White', description: 'Dos shots de espresso con leche texturizada de micro espuma', ingredients: 'café de especialidad, leche entera', price: 3500, category: 'cafés de especialidad', allergens: 'lácteos' },
      { name: 'Cortado', description: 'Espresso cortado con igual medida de leche tibia', ingredients: 'café de especialidad, leche entera', price: 2900, category: 'cafés de especialidad', allergens: 'lácteos' },
      { name: 'Latte de vainilla', description: 'Espresso doble, jarabe de vainilla natural y leche al vapor con decoración latte art', ingredients: 'café, leche entera, jarabe de vainilla natural', price: 4200, category: 'cafés de especialidad', allergens: 'lácteos' },
      { name: 'Cold Brew', description: 'Infusión fría de 18 horas, servida con hielo y un toque de jarabe de panela', ingredients: 'café de especialidad, agua filtrada, panela, hielo', price: 4500, category: 'cafés de especialidad', allergens: 'ninguno' },
      { name: 'Matcha Latte', description: 'Matcha ceremonial japonés con leche de avena o entera al vapor', ingredients: 'matcha ceremonial, leche de avena o leche entera', price: 4900, category: 'cafés de especialidad', allergens: 'lácteos' },
      // Tés e infusiones
      { name: 'Té verde sencha', description: 'Té verde japonés de primer flush, infusión a 70°C', ingredients: 'té verde sencha', price: 2900, category: 'tés e infusiones', allergens: 'ninguno' },
      { name: 'Chai especiado', description: 'Mezcla de especias con té negro, leche vegetal al vapor y miel de ulmo', ingredients: 'té negro, canela, cardamomo, jengibre, clavo, pimienta negra, leche de avena, miel', price: 3900, category: 'tés e infusiones', allergens: 'lácteos' },
      { name: 'Kombucha de jengibre y limón', description: 'Kombucha artesanal fermentada 14 días con jengibre fresco y limón de pica', ingredients: 'té negro, azúcar de caña, cultivo scoby, jengibre, limón', price: 4200, category: 'tés e infusiones', allergens: 'ninguno' },
      // Desayunos
      { name: 'Tostadas de masa madre con palta', description: 'Pan de masa madre tostado con palta aplastada, tomate cherry, semillas de sésamo y aceite de oliva', ingredients: 'pan de masa madre, palta, tomate cherry, sésamo, aceite de oliva, sal de mar, limón', price: 6900, category: 'desayunos', allergens: 'gluten, sésamo' },
      { name: 'Granola de la casa con yogur', description: 'Granola artesanal horneada con miel, nueces y avena, sobre yogur griego y frutos del bosque', ingredients: 'avena, nueces, miel de ulmo, coco rallado, yogur griego, arándanos, frambuesas', price: 7500, category: 'desayunos', allergens: 'gluten, lácteos, frutos secos' },
      { name: 'Huevo pochado con tostada', description: 'Huevo pochado sobre tostada de centeno con rúcula, tomates asados y vinagreta de mostaza', ingredients: 'huevo, pan de centeno, rúcula, tomates cherry, mostaza de Dijon, vinagre de manzana, aceite de oliva', price: 8500, category: 'desayunos', allergens: 'gluten, huevo' },
      { name: 'Porridge de avena', description: 'Avena cocida en leche de almendras con plátano caramelizado, miel y canela', ingredients: 'avena, leche de almendras, plátano, miel, canela, nueces', price: 6500, category: 'desayunos', allergens: 'gluten, frutos secos' },
      // Pasteles y tortas
      { name: 'Croissant de mantequilla', description: 'Croissant hojaldrado de 72 horas de fermentación en frío, con mantequilla artesanal', ingredients: 'harina de fuerza, mantequilla, leche, levadura, huevo, sal', price: 3900, category: 'pasteles y tortas', allergens: 'gluten, lácteos, huevo' },
      { name: 'Brownie de chocolate negro', description: 'Brownie denso de chocolate 72% con nueces tostadas y sal de mar', ingredients: 'chocolate negro, mantequilla, huevos, azúcar, harina, nueces, sal de mar', price: 4200, category: 'pasteles y tortas', allergens: 'gluten, lácteos, huevo, frutos secos' },
      { name: 'Cheesecake de maracuyá', description: 'Base de galleta de mantequilla con relleno cremoso de queso crema y coulis de maracuyá', ingredients: 'galletas, mantequilla, queso crema, azúcar, huevo, maracuyá', price: 5500, category: 'pasteles y tortas', allergens: 'gluten, lácteos, huevo' },
      { name: 'Muffin de arándanos', description: 'Muffin esponjoso con arándanos frescos de la Araucanía y ralladura de limón', ingredients: 'harina, huevo, mantequilla, azúcar, arándanos, limón, leche', price: 3500, category: 'pasteles y tortas', allergens: 'gluten, lácteos, huevo' },
      // Sándwiches y ensaladas
      { name: 'Sándwich de pollo asado', description: 'Pechuga de pollo asada al horno con rúcula, tomate, queso mantecoso y mayonesa de hierbas en ciabatta', ingredients: 'ciabatta, pollo, rúcula, tomate, queso mantecoso, mayonesa, albahaca, perejil', price: 9900, category: 'sándwiches y ensaladas', allergens: 'gluten, huevo, lácteos' },
      { name: 'Bowl mediterráneo', description: 'Quínoa, garbanzos especiados, pepino, tomate, cebolla morada, feta y vinagreta de limón', ingredients: 'quínoa, garbanzos, pepino, tomate, cebolla morada, queso feta, limón, aceite de oliva, menta', price: 10900, category: 'sándwiches y ensaladas', allergens: 'lácteos' },
      { name: 'Ensalada verde con vinagreta de miso', description: 'Mix de hojas verdes, pepino, edamame, semillas de girasol y vinagreta de miso blanco y sésamo', ingredients: 'mezcla de hojas, pepino, edamame, semillas de girasol, miso blanco, sésamo, vinagre de arroz, aceite de sésamo', price: 9500, category: 'sándwiches y ensaladas', allergens: 'soya, sésamo' },
    ],
  },
];

// ── Legacy seed data (for the `restaurants` table) ───────────────────────
// Kept for backwards compatibility with scripts/seed.ts.
// These are not the demo businesses shown in the app.
export interface RestaurantSeedData {
  name: string;
  slug: string;
  description: string;
  dishes: DishData[];
}

export const SEED_RESTAURANTS: RestaurantSeedData[] = [];
