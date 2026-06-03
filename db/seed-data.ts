export interface DishData {
  name: string;
  description: string;
  ingredients: string;
  price: number;
  category: string;
  allergens: string;
}

export interface RestaurantSeedData {
  name: string;
  slug: string;
  description: string;
  dishes: DishData[];
}

export const SEED_RESTAURANTS: RestaurantSeedData[] = [
  {
    name: 'Izakaya Nami',
    slug: 'izakaya-nami',
    description: 'Gastropub japonés con platos tradicionales de izakaya',
    dishes: [
      { name: 'Karaage', description: 'Pollo frito crocante marinado en soya, jengibre y sake', ingredients: 'pollo, soya, jengibre, sake, almidón de papa', price: 8500, category: 'entradas', allergens: 'gluten, soya' },
      { name: 'Takoyaki', description: 'Bolitas de pulpo con escamas de bonito y salsa okonomiyaki', ingredients: 'pulpo, harina, huevo, escamas de bonito, salsa okonomiyaki, mayonesa japonesa', price: 7000, category: 'entradas', allergens: 'gluten, mariscos, huevo' },
      { name: 'Gyoza', description: 'Dumplings de cerdo y repollo a la plancha', ingredients: 'cerdo, repollo, cebollín, jengibre, ajo, masa de gyoza', price: 6500, category: 'entradas', allergens: 'gluten, cerdo' },
      { name: 'Edamame', description: 'Porotos de soya al vapor con sal', ingredients: 'edamame, sal', price: 4000, category: 'entradas', allergens: 'soya' },
      { name: 'Tonkotsu Ramen', description: 'Ramen de caldo de hueso de cerdo con chashu, huevo cocido y nori', ingredients: 'fideos ramen, caldo de hueso de cerdo, chashu, huevo cocido, nori, cebollín, bambú', price: 12000, category: 'principales', allergens: 'gluten, cerdo, huevo' },
      { name: 'Matcha Nama Choco', description: 'Cuadritos de chocolate crudo de matcha', ingredients: 'chocolate blanco, crema, matcha en polvo', price: 5000, category: 'postres', allergens: 'lácteos' },
    ],
  },
  {
    name: 'Bocas del Mar',
    slug: 'bocas-del-mar',
    description: 'Restaurant peruano de autor. Mariscos, ceviches y cocina de fusión con sabores auténticos de la cultura Inca.',
    dishes: [
      // Recomendaciones del Chef
      { name: 'Causa de Cangrejo', description: 'Acompañado con chicharrón de pescado y mariscos, salsa acevichada y criolla', ingredients: 'cangrejo, papa amarilla, chicharrón de pescado, mariscos, salsa acevichada, criolla', price: 16990, category: 'chef', allergens: 'mariscos, pescado, gluten' },
      { name: 'Ceviche Bocas', description: 'Pesca del día y mixtura de mariscos, leche de tigre de rocoto y ají amarillo, brocheta de pescado', ingredients: 'pesca del día, mariscos mixtos, rocoto, ají amarillo, limón, cebolla, cilantro', price: 18990, category: 'chef', allergens: 'mariscos, pescado' },
      { name: 'Tacu Tacu de Lomo Saltado', description: 'Mezcla de arroz y frijoles dorados, coronado con lomo saltado', ingredients: 'arroz, frijoles, lomo de res, cebolla morada, tomate, sillao, ají amarillo', price: 18990, category: 'chef', allergens: 'gluten, soya' },
      { name: 'Arroz Meloso', description: 'Arroz meloso, mixtura de mariscos, huancaína, chalaquita y palta', ingredients: 'arroz, mariscos mixtos, ají amarillo, queso, leche, palta, cebolla, tomate', price: 17990, category: 'chef', allergens: 'mariscos, lácteos' },
      { name: 'Panceta Crocante', description: 'Panceta crocante acompañada de papas crocantes, camote y criolla', ingredients: 'panceta de cerdo, papas, camote, cebolla morada, tomate, culantro', price: 16990, category: 'chef', allergens: 'cerdo' },
      { name: 'Picante de Mariscos', description: 'Pesca del día al grill, bañado en salsa de mariscos y arroz blanco', ingredients: 'pesca del día, mariscos mixtos, ají amarillo, ají panca, arroz blanco', price: 18990, category: 'chef', allergens: 'mariscos, pescado' },
      { name: 'Linguini a lo Macho', description: 'Acompañado con mixtura de mariscos, ostiones gratinados en salsa macho', ingredients: 'linguini, mariscos mixtos, ostiones, ají amarillo, crema, queso parmesano', price: 18990, category: 'chef', allergens: 'gluten, mariscos, lácteos' },
      { name: 'Gyozas de Pato', description: 'De pato confit con espejo de salsa huancaína', ingredients: 'pato confit, masa de gyoza, ají amarillo, queso, leche', price: 15990, category: 'chef', allergens: 'gluten, lácteos' },
      { name: 'Garrón de Cordero', description: 'Acompañado con risotto a la huancaína', ingredients: 'garrón de cordero, arroz arbóreo, ají amarillo, queso, caldo de cordero', price: 24990, category: 'chef', allergens: 'lácteos' },
      { name: 'Fetuccini Huancaína con Saltado de Camarón', description: 'Fetuccini con salsa huancaína y saltado de camarones, con aromas peruanos', ingredients: 'fetuccini, camarones, ají amarillo, queso fresco, leche, galleta de soda, cebolla, tomate', price: 17990, category: 'chef', allergens: 'gluten, mariscos, lácteos' },

      // Ceviches (Frías)
      { name: 'Ceviche Clásico', description: 'Pesca del día, mixtura de mariscos, leche de tigre, choclo, canchita y camote glaseado', ingredients: 'pesca del día, mariscos, limón, ají limo, cebolla morada, cilantro, choclo, camote', price: 16990, category: 'ceviches', allergens: 'mariscos, pescado' },
      { name: 'Ceviche Mixto de Salmón', description: 'Salmón fresco, mixtura de mariscos, leche de tigre, choclo, canchita y camote glaseado', ingredients: 'salmón, mariscos, limón, ají limo, cebolla morada, cilantro, choclo, camote', price: 19990, category: 'ceviches', allergens: 'mariscos, pescado' },
      { name: 'Ceviche Carretillero', description: 'Pesca del día, chicharrón de mariscos, leche de tigre, canchita y camote glaseado', ingredients: 'pesca del día, chicharrón de mariscos, limón, ají limo, cebolla morada, canchita, camote', price: 19990, category: 'ceviches', allergens: 'mariscos, pescado, gluten' },
      { name: 'Ceviche de Atún Rojo', description: 'Atún rojo con mixtura de mariscos, leche de tigre de rocoto, canchita y camote glaseado', ingredients: 'atún rojo, mariscos, rocoto, limón, cebolla morada, cilantro, canchita, camote', price: 15990, category: 'ceviches', allergens: 'mariscos, pescado' },
      { name: 'Ceviche Trilogía', description: 'De atún al rocoto, salmón al ají amarillo y pesca del día clásico', ingredients: 'atún, salmón, pesca del día, rocoto, ají amarillo, limón, cebolla morada, cilantro', price: 19990, category: 'ceviches', allergens: 'mariscos, pescado' },

      // Tiraditos (Frías)
      { name: 'Tiradito Pulpo al Olivo', description: 'Pulpo con mixtura de mariscos en salsa de olivo, leche de tigre, choclo, canchita y camote glaseado', ingredients: 'pulpo, mariscos, aceitunas negras, limón, ají amarillo, choclo, camote', price: 21990, category: 'tiraditos', allergens: 'mariscos' },
      { name: 'Tiradito de Atún Pasionario', description: 'Salmón fresco, mixtura de mariscos, leche de tigre, choclo, canchita y camote glaseado', ingredients: 'atún, salmón, mariscos, maracuyá, limón, ají amarillo, choclo, camote', price: 15990, category: 'tiraditos', allergens: 'mariscos, pescado' },
      { name: 'Tiradito de Locos', description: 'Pesca del día, chicharrón de mariscos, leche de tigre, canchita y camote glaseado', ingredients: 'locos, pesca del día, chicharrón de mariscos, limón, ají limo, canchita, camote', price: 24990, category: 'tiraditos', allergens: 'mariscos, pescado, gluten' },
      { name: 'Tiradito de Salmón', description: 'Salmón con mixtura de mariscos, leche de tigre de rocoto, canchita y camote glaseado', ingredients: 'salmón, mariscos, rocoto, limón, cebolla morada, cilantro, canchita, camote', price: 18990, category: 'tiraditos', allergens: 'mariscos, pescado' },

      // Entradas Calientes
      { name: 'Brocheta de Res', description: 'De lomo liso, criolla, papas doradas, choclo al grill y papas fritas', ingredients: 'lomo liso de res, cebolla morada, tomate, papas, choclo', price: 14990, category: 'entradas', allergens: 'ninguno' },
      { name: 'Brocheta de Pulpo', description: 'Con chimichurri, criolla, papas doradas, choclo al grill y papas fritas', ingredients: 'pulpo, chimichurri, cebolla morada, tomate, papas, choclo', price: 22990, category: 'entradas', allergens: 'mariscos' },
      { name: 'Afrodisíaco de Camarón', description: 'Camarones empanizados y bañados en salsa afrodisíaca', ingredients: 'camarones, panko, huevo, salsa afrodisíaca (ají amarillo, limón, mayonesa)', price: 14990, category: 'entradas', allergens: 'mariscos, gluten, huevo' },
      { name: 'Machas Parmesanas', description: 'Machas gratinadas con abundante queso', ingredients: 'machas, queso parmesano, mantequilla, ajo', price: 15990, category: 'entradas', allergens: 'mariscos, lácteos' },
      { name: 'Empanadas de Lomo Saltado', description: 'Acompañado con salsa huancaína y chalaquita', ingredients: 'masa de empanada, lomo de res, cebolla morada, tomate, ají amarillo, salsa huancaína', price: 12990, category: 'entradas', allergens: 'gluten, lácteos' },
      { name: 'Wantán de Corvina', description: 'Estilo oriental, con salsa de tamarindo', ingredients: 'corvina, masa de wantán, tamarindo, jengibre, sillao', price: 12990, category: 'entradas', allergens: 'gluten, mariscos, soya' },
      { name: 'Empanada de Ají de Gallina', description: 'Con abundante relleno de ají de gallina, con salsa huancaína', ingredients: 'masa de empanada, pollo, ají amarillo, pan de molde, leche, queso, nueces', price: 12990, category: 'entradas', allergens: 'gluten, lácteos, frutos secos' },
      { name: 'Empanada de Pulpo', description: 'Estilo peruano, con chalaquita y mayo de olivo', ingredients: 'masa de empanada, pulpo, aceitunas negras, cebolla, tomate, mayonesa de olivo', price: 12990, category: 'entradas', allergens: 'gluten, mariscos, huevo' },

      // Principales - Carnes/Tierra
      { name: 'Lomo Saltado', description: 'Filete de res, cebolla morada y tomate, salsa de lomo saltado, papas rústicas y arroz criollo', ingredients: 'filete de res, cebolla morada, tomate, ají amarillo, sillao, papas, arroz', price: 15990, category: 'carnes', allergens: 'gluten, soya' },
      { name: 'Tacu Tacu con Entraña', description: 'Tacu tacu al grill con chimichurri de pimientos y reducción de vino tinto', ingredients: 'arroz, frijoles, entraña de res, pimientos, vino tinto, chimichurri', price: 24000, category: 'carnes', allergens: 'gluten' },
      { name: 'Fetuccini Huancaína', description: 'Fetuccini a la huancaína acompañado con lomo saltado', ingredients: 'fetuccini, ají amarillo, queso fresco, leche, galleta de soda, lomo de res, cebolla, tomate', price: 17990, category: 'carnes', allergens: 'gluten, lácteos' },
      { name: 'Asado de Tira', description: 'Braseado por 8 horas a baja temperatura, con puré de papas y salsa de seco norteño', ingredients: 'asado de tira, papas, culantro, ají amarillo, chicha de jora, arveja', price: 24990, category: 'carnes', allergens: 'lácteos' },
      { name: 'Pesto Criollo', description: 'Con spaguetti al pesto criollo y filete apanado', ingredients: 'spaguetti, albahaca, aceite de oliva, ajo, queso parmesano, filete de res apanado, huevo, pan rallado', price: 18990, category: 'carnes', allergens: 'gluten, lácteos, huevo' },
      { name: 'Lomo Liso a la Pimienta', description: 'Con papas rústicas bañadas en salsa de quesos', ingredients: 'lomo liso de res, pimienta negra, papas, crema, queso gouda, queso parmesano', price: 16990, category: 'carnes', allergens: 'lácteos' },
      { name: 'Lomo Vetado Strogonoff', description: 'Bañado en salsa de hongos y arroz blanco', ingredients: 'lomo vetado de res, hongos mixtos, crema, mostaza, cebolla, arroz blanco', price: 18990, category: 'carnes', allergens: 'lácteos, gluten' },
      { name: 'Plateada', description: 'Braseada por 12 horas a baja temperatura, bañada en salsa de champiñones y arroz', ingredients: 'plateada de res, champiñones, cebolla, ajo, vino tinto, arroz blanco', price: 17990, category: 'carnes', allergens: 'gluten' },
      { name: 'Camarones Envueltos', description: 'Con fetuccini a la huancaína, bañados en salsa de lomo', ingredients: 'camarones, fetuccini, ají amarillo, queso, leche, filete de res, sillao', price: 18990, category: 'carnes', allergens: 'gluten, mariscos, lácteos, soya' },
      { name: 'Lomo a Nuestro Estilo', description: 'Lomo vetado y camarones al grill, bañados en salsa de lomo con fetuccini a la huancaína', ingredients: 'lomo vetado, camarones, fetuccini, ají amarillo, queso, leche, sillao', price: 19990, category: 'carnes', allergens: 'gluten, mariscos, lácteos, soya' },
      { name: 'Ají de Gallina', description: 'Crema de ají amarillo con pollo desmenuzado, acompañado con papas y arroz blanco', ingredients: 'pollo, ají amarillo, pan de molde, leche, queso parmesano, nueces, papas, arroz', price: 14990, category: 'carnes', allergens: 'gluten, lácteos, frutos secos' },
      { name: 'Costillas BBQ', description: 'Costillas acompañadas con papas fritas', ingredients: 'costillas de cerdo, salsa BBQ, papas fritas', price: 18990, category: 'carnes', allergens: 'gluten' },

      // Principales - Pescados/Mar
      { name: 'Arroz Cremoso al Pesto', description: 'Arroz cremoso con filete de salmón al grill, bañado en salsa de maracuyá', ingredients: 'arroz arbóreo, salmón, albahaca, aceite de oliva, maracuyá, queso', price: 17990, category: 'pescados', allergens: 'pescado, lácteos' },
      { name: 'Salmón Gratinado', description: 'Con salsa de quesos, con papas salteadas en mantequilla de romero', ingredients: 'salmón, queso gouda, queso parmesano, crema, papas, romero, mantequilla', price: 17990, category: 'pescados', allergens: 'pescado, lácteos' },
      { name: 'Tacu Tacu con Mariscos', description: 'Relleno de plátano maduro y bañado en salsa de mariscos con ajíes peruanos', ingredients: 'arroz, frijoles, plátano maduro, mariscos mixtos, ají amarillo, ají panca', price: 19990, category: 'pescados', allergens: 'mariscos' },
      { name: 'Salmón en Mantequilla de Limón', description: 'Al grill, con papas salteadas con cebolla y chimichurri', ingredients: 'salmón, mantequilla, limón, papas, cebolla, chimichurri (perejil, ajo, aceite, vinagre)', price: 17990, category: 'pescados', allergens: 'pescado, lácteos' },
      { name: 'Atún a lo Macho', description: 'Atún al grill, bañado con mixtura de mariscos en salsa macho y arroz con choclo', ingredients: 'atún, mariscos mixtos, ají amarillo, ají panca, crema, arroz, choclo', price: 16990, category: 'pescados', allergens: 'pescado, mariscos, lácteos' },
      { name: 'Atún al Ajillo', description: 'Con mixtura de mariscos y papas salteadas', ingredients: 'atún, mariscos mixtos, ajo, aceite de oliva, ají limo, papas', price: 16990, category: 'pescados', allergens: 'pescado, mariscos' },
      { name: 'Pulpo a la Parrilla', description: 'Acompañado con fetuccini en salsa huancaína y chimichurri peruano', ingredients: 'pulpo, fetuccini, ají amarillo, queso fresco, leche, chimichurri, papas', price: 24000, category: 'pescados', allergens: 'mariscos, gluten, lácteos' },
      { name: 'Fruto di Mare', description: 'Fetuccini bañados en crema blanca de mariscos y parmesano', ingredients: 'fetuccini, mariscos mixtos, crema, queso parmesano, ajo, vino blanco', price: 16990, category: 'pescados', allergens: 'gluten, mariscos, lácteos' },

      // Menú Kids
      { name: 'Chicharrón de Pescado (Kids)', description: 'Chicharrón de pescado con papas fritas', ingredients: 'filete de pescado, panko, huevo, papas fritas', price: 16990, category: 'kids', allergens: 'gluten, pescado, huevo' },
      { name: 'Pechuga de Pollo (Kids)', description: 'Pechuga de pollo con papas fritas', ingredients: 'pechuga de pollo, papas fritas', price: 12990, category: 'kids', allergens: 'ninguno' },
      { name: 'Pechuga de Pollo Gratinada (Kids)', description: 'Pechuga de pollo gratinada con queso, con papas fritas', ingredients: 'pechuga de pollo, queso, papas fritas', price: 14990, category: 'kids', allergens: 'lácteos' },

      // Postres
      { name: 'Cheesecake New York Brownie', description: 'Tarta de queso crema con trozos de brownie, base de oreo, chantilly, brownie bites y salsa de nutella', ingredients: 'queso crema, brownie, oreo, crema chantilly, nutella', price: 6990, category: 'postres', allergens: 'lácteos, gluten, huevo, frutos secos' },
      { name: 'Pastel de Nuez', description: 'Bizcocho de nuez relleno de frosting de vainilla francesa con nueces y manjar, decorado con nueces caramelizadas', ingredients: 'nueces, harina, huevo, mantequilla, frosting de vainilla, manjar', price: 5500, category: 'postres', allergens: 'frutos secos, gluten, lácteos, huevo' },
      { name: 'Suspiro Limeña', description: 'Clásico postre peruano de manjar blanco y merengue de Oporto', ingredients: 'manjar blanco, leche evaporada, oporto, canela', price: 5500, category: 'postres', allergens: 'lácteos, huevo' },
      { name: 'Crema Volteada', description: 'Clásico flan peruano de leche condensada y leche evaporada', ingredients: 'leche condensada, leche evaporada, huevo, vainilla, caramelo', price: 5500, category: 'postres', allergens: 'lácteos, huevo' },
      { name: 'Volcán de Chocolate', description: 'Bizcocho caliente relleno de salsa de chocolate, con helado de estación y reducción de frutos del bosque (15 a 20 min de preparación)', ingredients: 'chocolate, mantequilla, harina, huevo, azúcar, helado, frutos del bosque', price: 6990, category: 'postres', allergens: 'gluten, lácteos, huevo' },

      // Cócteles
      { name: 'Mojito', description: 'Cóctel clásico con ron, menta, limón y soda', ingredients: 'ron blanco, menta fresca, limón, azúcar, soda', price: 5800, category: 'cócteles', allergens: 'ninguno' },
      { name: 'Old Fashioned', description: 'Whisky con bitter, azúcar y naranja', ingredients: 'whisky bourbon, bitter angostura, azúcar, naranja', price: 6500, category: 'cócteles', allergens: 'ninguno' },
      { name: 'Moscow Mule', description: 'Vodka, ginger beer y limón', ingredients: 'vodka, ginger beer, jugo de limón, menta', price: 6800, category: 'cócteles', allergens: 'ninguno' },
      { name: 'Mojito Maracuyá', description: 'Mojito con pulpa de maracuyá', ingredients: 'ron blanco, maracuyá, menta fresca, limón, azúcar, soda', price: 6800, category: 'cócteles', allergens: 'ninguno' },
      { name: 'Aperol Spritz', description: 'Aperol, prosecco y soda', ingredients: 'aperol, prosecco, soda, naranja', price: 5800, category: 'cócteles', allergens: 'ninguno' },
      { name: 'Negroni', description: 'Gin, vermut rojo y campari', ingredients: 'gin, vermut rojo, campari, naranja', price: 6500, category: 'cócteles', allergens: 'ninguno' },
      { name: 'Caipiriña', description: 'Cachaça, limón y azúcar', ingredients: 'cachaça, limón, azúcar', price: 5500, category: 'cócteles', allergens: 'ninguno' },
      { name: 'Tequila Margarita', description: 'Tequila, triple sec y jugo de limón', ingredients: 'tequila, triple sec, jugo de limón, sal', price: 5900, category: 'cócteles', allergens: 'ninguno' },
      { name: 'Gilligans Mule', description: 'Combinación tropical de espíritus con ginger beer', ingredients: 'ron, ginger beer, frutas tropicales, limón', price: 7990, category: 'cócteles', allergens: 'ninguno' },
      { name: 'Sevilla Spritz', description: 'Tanqueray Flor de Sevilla, tónica y agua de azahar', ingredients: 'Tanqueray Flor de Sevilla, agua tónica, agua de azahar, naranja', price: 7500, category: 'cócteles', allergens: 'ninguno' },
      { name: 'Tanqueray Ten Collins', description: 'Tanqueray Ten, té manzanilla, jugo limón, jarabe de goma, agua con gas', ingredients: 'Tanqueray Ten, té manzanilla, limón, jarabe de goma, agua con gas', price: 8990, category: 'cócteles', allergens: 'ninguno' },

      // Piscos
      { name: 'Pisco Sour Catedral', description: 'Pisco sour clásico estilo peruano con clara de huevo', ingredients: 'pisco, jugo de limón, jarabe de goma, clara de huevo, bitter angostura', price: 5800, category: 'piscos', allergens: 'huevo' },
      { name: 'Pisco Sour de Mango/Maracuyá', description: 'Pisco sour con pulpa de mango o maracuyá', ingredients: 'pisco, mango o maracuyá, jugo de limón, jarabe de goma, clara de huevo', price: 6500, category: 'piscos', allergens: 'huevo' },
      { name: 'Pisco Sour Chicha Morada', description: 'Pisco sour con chicha morada peruana', ingredients: 'pisco, chicha morada, jugo de limón, jarabe de goma, clara de huevo', price: 6600, category: 'piscos', allergens: 'huevo' },
      { name: 'Pisco Sour Vaticano', description: 'Pisco sour premium de gran tamaño', ingredients: 'pisco premium, jugo de limón, jarabe de goma, clara de huevo, bitter angostura', price: 9990, category: 'piscos', allergens: 'huevo' },
      { name: 'Chilcano', description: 'Pisco con ginger ale y jugo de limón', ingredients: 'pisco, ginger ale, jugo de limón, bitter angostura', price: 5800, category: 'piscos', allergens: 'ninguno' },
      { name: 'Chilcano Maracuyá', description: 'Pisco con ginger ale, limón y maracuyá', ingredients: 'pisco, maracuyá, ginger ale, jugo de limón', price: 6800, category: 'piscos', allergens: 'ninguno' },
      { name: 'Degustación de Sour (4 Sabores)', description: 'Cuatro pisco sour de diferentes sabores para degustar', ingredients: 'pisco, limón, jarabe de goma, clara de huevo, sabores variados', price: 24990, category: 'piscos', allergens: 'huevo' },

      // Cervezas
      { name: 'Cusqueña', description: 'Cerveza peruana premium tipo lager', ingredients: 'agua, malta de cebada, lúpulo, levadura', price: 4500, category: 'cervezas', allergens: 'gluten' },
      { name: 'Corona', description: 'Cerveza mexicana tipo lager', ingredients: 'agua, malta de cebada, lúpulo, levadura', price: 4500, category: 'cervezas', allergens: 'gluten' },
      { name: 'Hoegaarden', description: 'Cerveza belga de trigo con notas de naranja y cilantro', ingredients: 'agua, trigo, cebada, lúpulo, semillas de cilantro, cáscara de naranja', price: 4500, category: 'cervezas', allergens: 'gluten' },
      { name: 'Leffe', description: 'Cerveza belga de abadía de carácter intenso', ingredients: 'agua, malta de cebada, lúpulo, levadura de abadía', price: 4500, category: 'cervezas', allergens: 'gluten' },
      { name: 'Kunstmann Torobayo', description: 'Cerveza artesanal chilena tipo lager premium', ingredients: 'agua, malta, lúpulo, levadura', price: 4900, category: 'cervezas', allergens: 'gluten' },
      { name: 'Shop Stella Artois 500cc', description: 'Stella Artois en formato de un litro', ingredients: 'agua, malta de cebada, lúpulo, levadura', price: 5400, category: 'cervezas', allergens: 'gluten' },
      { name: 'Michelada', description: 'Cerveza con limón, sal y salsa', ingredients: 'cerveza, jugo de limón, sal, salsa inglesa', price: 800, category: 'cervezas', allergens: 'gluten' },

      // Sin alcohol
      { name: 'Tómalo sin Culpa', description: 'Bebida sin alcohol en sabores piña, frambuesa o maracuyá', ingredients: 'frutas naturales, soda, menta, jarabe de goma', price: 4990, category: 'sin alcohol', allergens: 'ninguno' },
      { name: 'Mojito Amazónico sin Alcohol', description: 'Menta, maracuyá y berries sin alcohol', ingredients: 'menta, maracuyá, berries, soda, limón, azúcar', price: 5500, category: 'sin alcohol', allergens: 'ninguno' },
      { name: 'Limonada Tropical', description: 'Limonada con menta, jengibre y mango', ingredients: 'limón, menta, jengibre, mango, agua, azúcar', price: 4500, category: 'sin alcohol', allergens: 'ninguno' },
      { name: 'Costeño', description: 'Pulpa de chirimoya, durazno y maracuyá', ingredients: 'chirimoya, durazno, maracuyá, agua, azúcar', price: 5990, category: 'sin alcohol', allergens: 'ninguno' },
      { name: 'Jugos Naturales', description: 'Jugos de frutas naturales del día', ingredients: 'frutas frescas de temporada', price: 3700, category: 'sin alcohol', allergens: 'ninguno' },
      { name: 'Limonada Menta Jengibre', description: 'Limonada fresca con menta y jengibre', ingredients: 'limón, menta, jengibre, agua, azúcar', price: 3400, category: 'sin alcohol', allergens: 'ninguno' },
    ],
  },
];
