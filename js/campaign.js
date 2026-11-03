// js/campaign.js - Datos y Lógica de la Campaña Individual "Aventura Ninja" (10 Mundos de Colombia)
// 10 Mundos, 50 Niveles de Plataformas 3D y 10 Batallas de Jefes Finales

export const CAMPAIGN_WORLDS = {
    1: {
        id: 'amazonas',
        number: 1,
        name: 'El corazón del Amazonas',
        region: 'Selva Amazónica',
        difficulty: 'Fácil',
        difficultyKey: 'easy',
        difficultyColor: '#22c55e',
        emoji: '🌴',
        bannerArt: 'linear-gradient(135deg, #15803d, #047857)',
        skyColor: 0x6ee7b7,
        fogColor: 0x34d399,
        groundColor: 0x14532d,
        description: 'Selva tropical ancestral con ríos caudalosos, ceibas gigantescas y templos de oro prehispánicos.',
        mechanicName: 'Cruces sobre el agua y troncos resbalosos',
        boss: {
            id: 'boss_anaconda',
            name: 'Anaconda Furtiva del Amazonas',
            title: 'Reina de los Esteros y Manglares',
            avatar: '🐍',
            health: 200,
            damage: 10,
            speed: 6.5,
            color: 0x15803d,
            specialAttack: 'Coletazo de Torbellino de Agua'
        },
        levels: [
            { level: 1, title: 'Sendero de las Ceibas', length: 65, gems: 3, crates: 4, enemies: 3, targetTime: 55 },
            { level: 2, title: 'El Cruce del Río Caudaloso', length: 75, gems: 3, crates: 5, enemies: 4, targetTime: 65 },
            { level: 3, title: 'Puente de Bambú Colgante', length: 85, gems: 3, crates: 5, enemies: 4, targetTime: 70 },
            { level: 4, title: 'Islas de Loto Sagrado', length: 95, gems: 3, crates: 6, enemies: 5, targetTime: 75 },
            { level: 5, title: 'Altar del Oro Quimbaya', length: 110, gems: 3, crates: 6, enemies: 6, targetTime: 85 }
        ]
    },
    2: {
        id: 'cafetero',
        number: 2,
        name: 'Las montañas cafeteras',
        region: 'Eje Cafetero y Paisa',
        difficulty: 'Fácil',
        difficultyKey: 'easy',
        difficultyColor: '#22c55e',
        emoji: '☕',
        bannerArt: 'linear-gradient(135deg, #b45309, #d97706)',
        skyColor: 0xfef08a,
        fogColor: 0xfde047,
        groundColor: 0x78350f,
        description: 'Colinas ondulantes de café en flor, haciendas con balcones coloniales y aroma a grano tostado.',
        mechanicName: 'Rampas empinadas y recolección de cerezas de café',
        boss: {
            id: 'boss_espantapajaros',
            name: 'Espantapájaros Mecánico del Cafetal',
            title: 'Custodio Autómata de la Cosecha',
            avatar: '🌾',
            health: 240,
            damage: 12,
            speed: 7.0,
            color: 0xd97706,
            specialAttack: 'Lluvia de Granos de Café Explosivos'
        },
        levels: [
            { level: 1, title: 'Colinas de Chapoleras', length: 70, gems: 3, crates: 4, enemies: 3, targetTime: 60 },
            { level: 2, title: 'El Beneficiadero Secreto', length: 80, gems: 3, crates: 5, enemies: 4, targetTime: 65 },
            { level: 3, title: 'Salto sobre la Molienda', length: 90, gems: 3, crates: 5, enemies: 5, targetTime: 75 },
            { level: 4, title: 'Hacienda de Tejas Rojas', length: 100, gems: 3, crates: 6, enemies: 5, targetTime: 80 },
            { level: 5, title: 'La Cima del Mirador Cafetero', length: 115, gems: 3, crates: 7, enemies: 6, targetTime: 90 }
        ]
    },
    3: {
        id: 'caribe',
        number: 3,
        name: 'El tesoro del Caribe',
        region: 'Costas y Murallas de Cartagena',
        difficulty: 'Fácil',
        difficultyKey: 'easy',
        difficultyColor: '#22c55e',
        emoji: '🏖️',
        bannerArt: 'linear-gradient(135deg, #0284c7, #06b6d4)',
        skyColor: 0x38bdf8,
        fogColor: 0xbae6fd,
        groundColor: 0xfef08a,
        description: 'Playas doradas de arena coralina, palmeras de coco y ciudadelas coloniales de piedra.',
        mechanicName: 'Plataformas sobre olas y trampolines de corales',
        boss: {
            id: 'boss_barbacoral',
            name: 'Capitán Corsario Barbacoral',
            title: 'Terror de los Galeones Hundidos',
            avatar: '🏴‍☠️',
            health: 280,
            damage: 14,
            speed: 7.2,
            color: 0x0284c7,
            specialAttack: 'Bombardeo de Coco-Cañones Piratas'
        },
        levels: [
            { level: 1, title: 'Playa de las Conchas', length: 75, gems: 3, crates: 4, enemies: 4, targetTime: 60 },
            { level: 2, title: 'El Muelle de los Pescadores', length: 85, gems: 3, crates: 5, enemies: 4, targetTime: 70 },
            { level: 3, title: 'Islas de Coral y Mareas', length: 95, gems: 3, crates: 6, enemies: 5, targetTime: 75 },
            { level: 4, title: 'Baluarte de las Murallas', length: 105, gems: 3, crates: 6, enemies: 6, targetTime: 85 },
            { level: 5, title: 'Galeón Fantasma Encallado', length: 120, gems: 3, crates: 7, enemies: 6, targetTime: 95 }
        ]
    },
    4: {
        id: 'frailejones',
        number: 4,
        name: 'El reino de los frailejones',
        region: 'Páramo de Sumapaz y Chingaza',
        difficulty: 'Medio',
        difficultyKey: 'medium',
        difficultyColor: '#38bdf8',
        emoji: '❄️',
        bannerArt: 'linear-gradient(135deg, #4f46e5, #0284c7)',
        skyColor: 0xa5b4fc,
        fogColor: 0xc7d2fe,
        groundColor: 0x334155,
        description: 'Cumbres andinas entre la niebla sagrada, donde los frailejones milenarios custodian el agua pura.',
        mechanicName: 'Ráfagas de viento andino y suelo escarchado',
        boss: {
            id: 'boss_guardian_paramo',
            name: 'Coloso Glacial del Páramo',
            title: 'Espíritu de las Lagunas Sagradas',
            avatar: '🏔️',
            health: 320,
            damage: 16,
            speed: 7.5,
            color: 0x6366f1,
            specialAttack: 'Ventisca Helada y Agujas de Escarcha'
        },
        levels: [
            { level: 1, title: 'Bosque de Frailejones Bebés', length: 80, gems: 3, crates: 5, enemies: 4, targetTime: 65 },
            { level: 2, title: 'La Laguna Encantada', length: 90, gems: 3, crates: 5, enemies: 5, targetTime: 75 },
            { level: 3, title: 'El Cañón de la Niebla', length: 100, gems: 3, crates: 6, enemies: 5, targetTime: 80 },
            { level: 4, title: 'Rocas de Viento Cruzado', length: 110, gems: 3, crates: 6, enemies: 6, targetTime: 90 },
            { level: 5, title: 'Cumbres del Nevado Ruiz', length: 125, gems: 3, crates: 8, enemies: 7, targetTime: 100 }
        ]
    },
    5: {
        id: 'desierto',
        number: 5,
        name: 'El desierto de los secretos',
        region: 'La Guajira y Desierto de la Tatacoa',
        difficulty: 'Medio',
        difficultyKey: 'medium',
        difficultyColor: '#38bdf8',
        emoji: '🏜️',
        bannerArt: 'linear-gradient(135deg, #ea580c, #ca8a04)',
        skyColor: 0xfed7aa,
        fogColor: 0xfdba74,
        groundColor: 0xc2410c,
        description: 'Tierras rojas esculpidas por el viento, fósiles milenarios, dunas del Cabo de la Vela y cactus gigantes.',
        mechanicName: 'Pozas de arenas movedizas y pilares rocosos delgados',
        boss: {
            id: 'boss_escorpion',
            name: 'Escorpión Real del Desierto',
            title: 'Monarca de las Dunas Doradas',
            avatar: '🦂',
            health: 360,
            damage: 18,
            speed: 8.0,
            color: 0xc2410c,
            specialAttack: 'Excavación Subterránea y Aguijón Sísmico'
        },
        levels: [
            { level: 1, title: 'Dunas de Taroa', length: 85, gems: 3, crates: 5, enemies: 4, targetTime: 70 },
            { level: 2, title: 'El Laberinto Rojo del Cuzco', length: 95, gems: 3, crates: 6, enemies: 5, targetTime: 80 },
            { level: 3, title: 'Oasis de las Chichas', length: 105, gems: 3, crates: 6, enemies: 5, targetTime: 85 },
            { level: 4, title: 'Pilares de Arcilla Hueca', length: 115, gems: 3, crates: 7, enemies: 6, targetTime: 95 },
            { level: 5, title: 'El Altar de las Estrellas', length: 130, gems: 3, crates: 8, enemies: 7, targetTime: 105 }
        ]
    },
    6: {
        id: 'pacifico',
        number: 6,
        name: 'Los misterios del Pacífico',
        region: 'Chocó y Bahía Solano',
        difficulty: 'Medio',
        difficultyKey: 'medium',
        difficultyColor: '#38bdf8',
        emoji: '🌊',
        bannerArt: 'linear-gradient(135deg, #0f766e, #0e7490)',
        skyColor: 0x99f6e4,
        fogColor: 0x5eead4,
        groundColor: 0x115e59,
        description: 'La selva más lluviosa del mundo donde las ballenas jorobadas cantan y los manglares esconden secretos.',
        mechanicName: 'Mareas fluctuantes y plataformas de raíces de mangle',
        boss: {
            id: 'boss_manglar',
            name: 'Monstruo del Manglar y Mareas',
            title: 'Protector de las Profundidades del Pacífico',
            avatar: '🐙',
            health: 410,
            damage: 20,
            speed: 7.8,
            color: 0x0f766e,
            specialAttack: 'Tentáculos de Raíz y Olas Gigantes'
        },
        levels: [
            { level: 1, title: 'Bajo de las Lluvias Eternas', length: 90, gems: 3, crates: 5, enemies: 5, targetTime: 75 },
            { level: 2, title: 'Raíces del Mangle Gigante', length: 100, gems: 3, crates: 6, enemies: 5, targetTime: 85 },
            { level: 3, title: 'Cascada de Nabugá', length: 110, gems: 3, crates: 6, enemies: 6, targetTime: 90 },
            { level: 4, title: 'Puente de Lianas Silvestres', length: 120, gems: 3, crates: 7, enemies: 6, targetTime: 100 },
            { level: 5, title: 'La Bahía de las Ballenas', length: 135, gems: 3, crates: 8, enemies: 7, targetTime: 110 }
        ]
    },
    7: {
        id: 'sabana',
        number: 7,
        name: 'La sabana de los gigantes',
        region: 'Llanos Orientales y Orinoquía',
        difficulty: 'Medio-alto',
        difficultyKey: 'medium-high',
        difficultyColor: '#f59e0b',
        emoji: '🌾',
        bannerArt: 'linear-gradient(135deg, #d97706, #65a30d)',
        skyColor: 0xfef08a,
        fogColor: 0xd9f99d,
        groundColor: 0x4d7c0f,
        description: 'Horizontes infinitos de pastizales dorados, palmas de moriche, manadas de chigüiros y ríos anchos.',
        mechanicName: 'Plataformas de paso rápido y corrientes fluviales veloces',
        boss: {
            id: 'boss_caiman',
            name: 'Caimán Titán Llanero',
            title: 'Monarca Acorazado del Orinoco',
            avatar: '🐊',
            health: 470,
            damage: 22,
            speed: 8.2,
            color: 0x4d7c0f,
            specialAttack: 'Embestida de Mordisco y Escamas de Hierro'
        },
        levels: [
            { level: 1, title: 'Tierra de Morichales', length: 95, gems: 3, crates: 5, enemies: 5, targetTime: 80 },
            { level: 2, title: 'El Estero de los Chigüiros', length: 105, gems: 3, crates: 6, enemies: 5, targetTime: 85 },
            { level: 3, title: 'La Sabana Inundada', length: 115, gems: 3, crates: 6, enemies: 6, targetTime: 95 },
            { level: 4, title: 'Cruces del Río Meta', length: 125, gems: 3, crates: 7, enemies: 7, targetTime: 105 },
            { level: 5, title: 'El Hato Sagrado de los Espíritus', length: 140, gems: 3, crates: 8, enemies: 7, targetTime: 115 }
        ]
    },
    8: {
        id: 'cano_cristales',
        number: 8,
        name: 'El río de los cinco colores',
        region: 'Serranía de la Macarena',
        difficulty: 'Difícil',
        difficultyKey: 'hard',
        difficultyColor: '#ef4444',
        emoji: '🌈',
        bannerArt: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
        skyColor: 0xfbcfe8,
        fogColor: 0xf5d0fe,
        groundColor: 0xbe185d,
        description: 'Considerado el río más hermoso del mundo por sus plantas acuáticas rojas, amarillas, verdes, azules y negras.',
        mechanicName: 'Plataformas de algas rítmicas multicolores y cascadas en espiral',
        boss: {
            id: 'boss_espectro_colores',
            name: 'Espectro de los Cinco Colores',
            title: 'Entidad Guardiana de la Macarenia',
            avatar: '✨',
            health: 530,
            damage: 25,
            speed: 8.6,
            color: 0xec4899,
            specialAttack: 'Rayo Prismático Quíntuple y Fusión Acuática'
        },
        levels: [
            { level: 1, title: 'Pozas de Macarenia Clavigera', length: 100, gems: 3, crates: 6, enemies: 5, targetTime: 85 },
            { level: 2, title: 'El Salto de los Cuarzos Rojos', length: 110, gems: 3, crates: 6, enemies: 6, targetTime: 90 },
            { level: 3, title: 'Pozos Circulares de Gigantes', length: 120, gems: 3, crates: 7, enemies: 6, targetTime: 100 },
            { level: 4, title: 'Cascada del Arcoíris Líquido', length: 135, gems: 3, crates: 7, enemies: 7, targetTime: 110 },
            { level: 5, title: 'El Manantial Primordial', length: 150, gems: 3, crates: 8, enemies: 8, targetTime: 120 }
        ]
    },
    9: {
        id: 'ciudad_perdida',
        number: 9,
        name: 'La ciudad perdida',
        region: 'Sierra Nevada de Santa Marta (Teyuna)',
        difficulty: 'Muy difícil',
        difficultyKey: 'very-hard',
        difficultyColor: '#dc2626',
        emoji: '🏛️',
        bannerArt: 'linear-gradient(135deg, #475569, #78716c)',
        skyColor: 0xcfd8dc,
        fogColor: 0x90a4ae,
        groundColor: 0x374151,
        description: 'Impresionante complejo arqueológico de terrazas de piedra construido por la civilización Tayrona en la selva alta.',
        mechanicName: 'Escaleras laberínticas, losas colapsables y trampas de dardos',
        boss: {
            id: 'boss_chaman_tayrona',
            name: 'Chamán Tayrona de las Sombras',
            title: 'Gran Sacerdote del Pico Colón',
            avatar: '👺',
            health: 600,
            damage: 28,
            speed: 8.8,
            color: 0x78716c,
            specialAttack: 'Invocación de Tótems Místicos y Niebla Ilusoria'
        },
        levels: [
            { level: 1, title: 'Los 1200 Escalones de Piedra', length: 110, gems: 3, crates: 6, enemies: 6, targetTime: 90 },
            { level: 2, title: 'Terrazas Circulares de Teyuna', length: 120, gems: 3, crates: 7, enemies: 6, targetTime: 100 },
            { level: 3, title: 'Puentes de Bejuco del Abismo', length: 135, gems: 3, crates: 7, enemies: 7, targetTime: 110 },
            { level: 4, title: 'El Templo del Jaguar Alado', length: 145, gems: 3, crates: 8, enemies: 7, targetTime: 120 },
            { level: 5, title: 'Cámara Sagrada del Oro Tayrona', length: 160, gems: 3, crates: 8, enemies: 8, targetTime: 130 }
        ]
    },
    10: {
        id: 'templo_biodiversidad',
        number: 10,
        name: 'El templo de la biodiversidad',
        region: 'Santuario Sagrado de las Cumbres de Colombia',
        difficulty: 'Experto',
        difficultyKey: 'expert',
        difficultyColor: '#a855f7',
        emoji: '💎',
        bannerArt: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        skyColor: 0xe9d5ff,
        fogColor: 0xd8b4fe,
        groundColor: 0x4c1d95,
        description: 'El núcleo místico donde converge toda la energía natural de Colombia. El desafío definitivo para los ninjas.',
        mechanicName: 'Plataformas de energía pura, rayos cósmicos y pruebas combinadas',
        boss: {
            id: 'boss_el_invernal_supremo',
            name: 'EL INVERNAL (Forma Suprema)',
            title: 'Traficante Supremo de la Energía de la Biodiversidad',
            avatar: '🐆',
            health: 750,
            damage: 34,
            speed: 9.2,
            color: 0x581c87,
            specialAttack: 'Prisión de Hielo Sombrío y Onda Cero Absoluto'
        },
        levels: [
            { level: 1, title: 'Ascenso al Núcleo de Energía', length: 120, gems: 3, crates: 7, enemies: 6, targetTime: 95 },
            { level: 2, title: 'Pilares de Cuarzo y Resonancia', length: 130, gems: 3, crates: 7, enemies: 7, targetTime: 105 },
            { level: 3, title: 'El Puente de los 4 Elementos', length: 145, gems: 3, crates: 8, enemies: 7, targetTime: 115 },
            { level: 4, title: 'Cámara de los Cristales Ancestrales', length: 160, gems: 3, crates: 8, enemies: 8, targetTime: 125 },
            { level: 5, title: 'La Puerta del Trono de Hielo', length: 180, gems: 3, crates: 9, enemies: 9, targetTime: 140 }
        ]
    }
};

// Función auxiliar para obtener el total de estrellas conseguidas en la campaña
export function calculateTotalStars(campaignData) {
    if (!campaignData || !campaignData.worlds) return 0;
    let total = 0;
    Object.values(campaignData.worlds).forEach(w => {
        if (w.levels) {
            Object.values(w.levels).forEach(lvl => {
                total += (lvl.stars || 0);
            });
        }
    });
    return total;
}
