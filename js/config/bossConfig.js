// js/config/bossConfig.js - Especificaciones y Patrones de los 10 Jefes de la Fauna Fantástica Colombiana
export const BOSS_CONFIGS = {
    1: {
        id: 'oso',
        worldNum: 1,
        name: 'Oso de Anteojos',
        title: 'Guardián de los Frailejones y Cumbres Andinas',
        avatar: '🐻',
        maxHealth: 280,
        baseDamage: 14,
        speed: 5.2,
        colorHex: 0x3f3f46,
        glowColor: 0xfef08a,
        element: 'wood',
        introQuote: '¡Nadie profana los páramos sagrados de Colombia!',
        defeatQuote: 'La fuerza de los frailejones ahora habita en tu espada...',
        rewardCoins: 250,
        rewardGems: 25,
        phase1: {
            telegraphDuration: 0.85,
            recoveryDuration: 0.65,
            attacks: [
                {
                    id: 'ground_stomp',
                    name: 'Pisotón Sísmico',
                    type: 'shockwave',
                    damageMult: 1.0,
                    range: 5.5,
                    cooldown: 3.2,
                    telegraphDesc: 'El oso se alza en dos patas levantando sus brazos',
                    voice: 'heavy'
                },
                {
                    id: 'claw_swipe',
                    name: 'Zarpazo Andino',
                    type: 'melee',
                    damageMult: 1.25,
                    range: 3.8,
                    cooldown: 2.5,
                    telegraphDesc: 'El oso prepara su garra derecha con destello amarillo',
                    voice: 'heavy'
                }
            ]
        },
        phase2: {
            triggerHpPercent: 0.60,
            transitionDuration: 1.6,
            speedMult: 1.25,
            telegraphDuration: 0.65,
            recoveryDuration: 0.45,
            enragedRoarText: '¡Furia de la Niebla de los Páramos!',
            attacks: [
                {
                    id: 'earthquake_frenzy',
                    name: 'Terremoto Radial con Fisuras',
                    type: 'shockwave',
                    damageMult: 1.45,
                    range: 8.5,
                    cooldown: 3.0,
                    voice: 'heavy'
                },
                {
                    id: 'avalanche_charge',
                    name: 'Embestida de Avalancha',
                    type: 'charge',
                    damageMult: 1.6,
                    speed: 16.0,
                    range: 14.0,
                    cooldown: 4.2,
                    voice: 'heavy'
                }
            ]
        }
    },
    2: {
        id: 'jaguar',
        worldNum: 2,
        name: 'Jaguar de las Sombras',
        title: 'Espíritu Furtivo del Amazonas y Chocó',
        avatar: '🐆',
        maxHealth: 320,
        baseDamage: 16,
        speed: 8.5,
        colorHex: 0xd97706,
        glowColor: 0xf97316,
        element: 'fire',
        introQuote: 'En la espesura de la selva, tú eres la presa...',
        defeatQuote: 'Tu velocidad supera el sigilo de las sombras...',
        rewardCoins: 300,
        rewardGems: 30,
        phase1: {
            telegraphDuration: 0.65,
            recoveryDuration: 0.55,
            attacks: [
                {
                    id: 'shadow_pounce',
                    name: 'Salto en Emboscada',
                    type: 'pounce',
                    damageMult: 1.15,
                    range: 9.0,
                    cooldown: 2.8,
                    voice: 'light'
                },
                {
                    id: 'double_claw',
                    name: 'Zarpazos Gemelos',
                    type: 'melee',
                    damageMult: 1.3,
                    range: 3.5,
                    cooldown: 2.2,
                    voice: 'light'
                }
            ]
        },
        phase2: {
            triggerHpPercent: 0.60,
            transitionDuration: 1.5,
            speedMult: 1.35,
            telegraphDuration: 0.45,
            recoveryDuration: 0.40,
            enragedRoarText: '¡Danza de Sombras Crepusculares!',
            attacks: [
                {
                    id: 'shadow_rush',
                    name: 'Ráfaga Espectral Furtiva',
                    type: 'teleport_strike',
                    damageMult: 1.55,
                    range: 15.0,
                    cooldown: 3.5,
                    voice: 'heavy'
                },
                {
                    id: 'flame_swipe',
                    name: 'Corte Incandescente',
                    type: 'melee',
                    damageMult: 1.4,
                    range: 4.5,
                    cooldown: 2.5,
                    voice: 'light'
                }
            ]
        }
    },
    3: {
        id: 'condor',
        worldNum: 3,
        name: 'Cóndor Andino',
        title: 'Señor de los Vientos Glaciares del Ruiz',
        avatar: '🦅',
        maxHealth: 360,
        baseDamage: 17,
        speed: 7.0,
        colorHex: 0x0284c7,
        glowColor: 0x38bdf8,
        element: 'steel',
        introQuote: 'Las alturas andinas solo pertenecen a los dignos...',
        defeatQuote: 'El cielo reconoce a un verdadero guerrero del aire...',
        rewardCoins: 350,
        rewardGems: 35,
        phase1: {
            telegraphDuration: 0.8,
            recoveryDuration: 0.6,
            attacks: [
                {
                    id: 'dive_bomb',
                    name: 'Picada de Halcón Andino',
                    type: 'dive',
                    damageMult: 1.2,
                    range: 10.0,
                    cooldown: 3.0,
                    voice: 'heavy'
                },
                {
                    id: 'wind_gust',
                    name: 'Ráfaga de Vendaval',
                    type: 'projectile',
                    damageMult: 1.0,
                    range: 12.0,
                    cooldown: 2.8,
                    voice: 'light'
                }
            ]
        },
        phase2: {
            triggerHpPercent: 0.60,
            transitionDuration: 1.6,
            speedMult: 1.25,
            telegraphDuration: 0.55,
            recoveryDuration: 0.42,
            enragedRoarText: '¡Torbellino Glacial de la Cordillera!',
            attacks: [
                {
                    id: 'feather_storm',
                    name: 'Lluvia de Plumas Navaja',
                    type: 'barrage',
                    damageMult: 1.5,
                    range: 14.0,
                    cooldown: 3.8,
                    voice: 'light'
                },
                {
                    id: 'cyclone_dive',
                    name: 'Tornado Descendente',
                    type: 'shockwave',
                    damageMult: 1.65,
                    range: 8.0,
                    cooldown: 4.0,
                    voice: 'heavy'
                }
            ]
        }
    },
    4: {
        id: 'rana',
        worldNum: 4,
        name: 'Rana Dorada Venenosa',
        title: 'Alquimista Sagrada del Chocó',
        avatar: '🐸',
        maxHealth: 400,
        baseDamage: 18,
        speed: 7.8,
        colorHex: 0xfacc15,
        glowColor: 0x16a34a,
        element: 'gold',
        introQuote: 'Una sola gota de mi toxina doblega a los ejércitos...',
        defeatQuote: 'Has purificado el veneno con honor...',
        rewardCoins: 400,
        rewardGems: 40,
        phase1: {
            telegraphDuration: 0.75,
            recoveryDuration: 0.55,
            attacks: [
                {
                    id: 'toxic_spit',
                    name: 'Escupitajo Tóxico Parabólico',
                    type: 'projectile',
                    damageMult: 1.1,
                    range: 11.0,
                    cooldown: 2.6,
                    voice: 'light'
                },
                {
                    id: 'elastic_jump',
                    name: 'Salto Elástico Contundente',
                    type: 'pounce',
                    damageMult: 1.25,
                    range: 8.0,
                    cooldown: 2.8,
                    voice: 'heavy'
                }
            ]
        },
        phase2: {
            triggerHpPercent: 0.60,
            transitionDuration: 1.5,
            speedMult: 1.3,
            telegraphDuration: 0.5,
            recoveryDuration: 0.4,
            enragedRoarText: '¡Niebla Dorada Corrosiva!',
            attacks: [
                {
                    id: 'acid_pool',
                    name: 'Charco de Ácido Precolombino',
                    type: 'zone',
                    damageMult: 1.45,
                    range: 9.0,
                    cooldown: 3.5,
                    voice: 'heavy'
                },
                {
                    id: 'poison_cloud',
                    name: 'Explosión de Esporas Tóxicas',
                    type: 'shockwave',
                    damageMult: 1.55,
                    range: 7.0,
                    cooldown: 3.2,
                    voice: 'light'
                }
            ]
        }
    },
    5: {
        id: 'chiguiro',
        worldNum: 5,
        name: 'Gran Chigüiro de los Llanos',
        title: 'Coloso de las Sabanas y Humedales del Orinoco',
        avatar: '🦫',
        maxHealth: 450,
        baseDamage: 20,
        speed: 6.0,
        colorHex: 0x854d0e,
        glowColor: 0x06b6d4,
        element: 'wood',
        introQuote: 'La fuerza de los esteros no se detiene ante nadie...',
        defeatQuote: 'Eres tan firme como las raíces del moriche...',
        rewardCoins: 450,
        rewardGems: 45,
        phase1: {
            telegraphDuration: 0.9,
            recoveryDuration: 0.7,
            attacks: [
                {
                    id: 'river_charge',
                    name: 'Embestida de Río',
                    type: 'charge',
                    damageMult: 1.2,
                    speed: 13.0,
                    range: 12.0,
                    cooldown: 3.2,
                    voice: 'heavy'
                },
                {
                    id: 'mud_splash',
                    name: 'Chapuzón de Lodo',
                    type: 'shockwave',
                    damageMult: 1.1,
                    range: 6.0,
                    cooldown: 2.8,
                    voice: 'heavy'
                }
            ]
        },
        phase2: {
            triggerHpPercent: 0.60,
            transitionDuration: 1.7,
            speedMult: 1.25,
            telegraphDuration: 0.6,
            recoveryDuration: 0.45,
            enragedRoarText: '¡Maremoto de los Llanos Orientales!',
            attacks: [
                {
                    id: 'tidal_surge',
                    name: 'Oleada Torrencial de Agua',
                    type: 'wave',
                    damageMult: 1.6,
                    range: 16.0,
                    cooldown: 4.0,
                    voice: 'heavy'
                },
                {
                    id: 'unyielding_rush',
                    name: 'Carga Acorazada Imparable',
                    type: 'charge',
                    damageMult: 1.5,
                    speed: 17.5,
                    range: 15.0,
                    cooldown: 3.6,
                    voice: 'heavy'
                }
            ]
        }
    },
    6: {
        id: 'arpia',
        worldNum: 6,
        name: 'Águila Arpía',
        title: 'Monarca de la Bóveda Celeste Amazónica',
        avatar: '🦅',
        maxHealth: 500,
        baseDamage: 22,
        speed: 8.0,
        colorHex: 0x475569,
        glowColor: 0x38bdf8,
        element: 'thunder',
        introQuote: 'Mis garras parten el acero con la velocidad del relámpago...',
        defeatQuote: 'Tus reflejos superan la vista de la reina celestial...',
        rewardCoins: 500,
        rewardGems: 50,
        phase1: {
            telegraphDuration: 0.7,
            recoveryDuration: 0.5,
            attacks: [
                {
                    id: 'talon_strike',
                    name: 'Garras Quirúrgicas Fulminantes',
                    type: 'dive',
                    damageMult: 1.3,
                    range: 11.0,
                    cooldown: 2.8,
                    voice: 'light'
                },
                {
                    id: 'shock_feather',
                    name: 'Plumas de Voltaje Eléctrico',
                    type: 'projectile',
                    damageMult: 1.1,
                    range: 13.0,
                    cooldown: 2.5,
                    voice: 'light'
                }
            ]
        },
        phase2: {
            triggerHpPercent: 0.60,
            transitionDuration: 1.5,
            speedMult: 1.35,
            telegraphDuration: 0.45,
            recoveryDuration: 0.38,
            enragedRoarText: '¡Tempestad Eléctrica de la Canopia!',
            attacks: [
                {
                    id: 'lightning_dive',
                    name: 'Rayo Fulminante en Caída Libre',
                    type: 'dive',
                    damageMult: 1.7,
                    range: 15.0,
                    cooldown: 3.8,
                    voice: 'heavy'
                },
                {
                    id: 'sonic_screech',
                    name: 'Chirrido Sónico Aturdidor',
                    type: 'shockwave',
                    damageMult: 1.4,
                    range: 9.0,
                    cooldown: 3.0,
                    voice: 'light'
                }
            ]
        }
    },
    7: {
        id: 'delfin',
        worldNum: 7,
        name: 'Delfín Rosado',
        title: 'Hechicero de las Aguas Dulces del Guaviare',
        avatar: '🐬',
        maxHealth: 540,
        baseDamage: 23,
        speed: 8.2,
        colorHex: 0xf472b6,
        glowColor: 0x06b6d4,
        element: 'light',
        introQuote: 'Las aguas rosadas guardan secretos que los humanos olvidaron...',
        defeatQuote: 'Has disuelto la ilusión con sabiduría y templanza...',
        rewardCoins: 550,
        rewardGems: 55,
        phase1: {
            telegraphDuration: 0.75,
            recoveryDuration: 0.55,
            attacks: [
                {
                    id: 'water_geyser',
                    name: 'Géiser Místico',
                    type: 'zone',
                    damageMult: 1.2,
                    range: 8.0,
                    cooldown: 2.8,
                    voice: 'light'
                },
                {
                    id: 'bubble_surge',
                    name: 'Burbujas Encantadas',
                    type: 'projectile',
                    damageMult: 1.05,
                    range: 12.0,
                    cooldown: 2.4,
                    voice: 'light'
                }
            ]
        },
        phase2: {
            triggerHpPercent: 0.60,
            transitionDuration: 1.5,
            speedMult: 1.3,
            telegraphDuration: 0.48,
            recoveryDuration: 0.38,
            enragedRoarText: '¡Espejismo de las Aguas Profundas!',
            attacks: [
                {
                    id: 'pink_maelstrom',
                    name: 'Remolino del Espejo Rosa',
                    type: 'shockwave',
                    damageMult: 1.6,
                    range: 10.0,
                    cooldown: 3.5,
                    voice: 'heavy'
                },
                {
                    id: 'aqua_mirage',
                    name: 'Acometida Espejismo',
                    type: 'charge',
                    damageMult: 1.45,
                    speed: 18.0,
                    range: 14.0,
                    cooldown: 3.0,
                    voice: 'light'
                }
            ]
        }
    },
    8: {
        id: 'perezoso',
        worldNum: 8,
        name: 'Perezoso Gigante Ancestral',
        title: 'Guardián Milenario de las Ceibas Centenarias',
        avatar: '🦥',
        maxHealth: 600,
        baseDamage: 25,
        speed: 4.8,
        colorHex: 0x713f12,
        glowColor: 0x15803d,
        element: 'wood',
        introQuote: 'La paciencia de la tierra pulveriza la prisa de los necios...',
        defeatQuote: 'El bosque te abraza como a uno de sus propios árboles...',
        rewardCoins: 600,
        rewardGems: 60,
        phase1: {
            telegraphDuration: 0.95,
            recoveryDuration: 0.75,
            attacks: [
                {
                    id: 'giant_sweep',
                    name: 'Barrido de Garras de Gran Alcance',
                    type: 'melee',
                    damageMult: 1.35,
                    range: 6.2,
                    cooldown: 3.0,
                    voice: 'heavy'
                },
                {
                    id: 'trunk_slam',
                    name: 'Golpe de Tronco Ancestral',
                    type: 'shockwave',
                    damageMult: 1.4,
                    range: 7.5,
                    cooldown: 3.4,
                    voice: 'heavy'
                }
            ]
        },
        phase2: {
            triggerHpPercent: 0.60,
            transitionDuration: 1.8,
            speedMult: 1.25,
            telegraphDuration: 0.7,
            recoveryDuration: 0.5,
            enragedRoarText: '¡Despertar de las Raíces Titánicas!',
            attacks: [
                {
                    id: 'vine_whip_storm',
                    name: 'Lianas Azotadoras desde el Techo',
                    type: 'zone',
                    damageMult: 1.65,
                    range: 11.0,
                    cooldown: 4.0,
                    voice: 'heavy'
                },
                {
                    id: 'seismic_crush',
                    name: 'Aplaste Sísmico Raíz',
                    type: 'shockwave',
                    damageMult: 1.8,
                    range: 9.0,
                    cooldown: 4.2,
                    voice: 'heavy'
                }
            ]
        }
    },
    9: {
        id: 'buho',
        worldNum: 9,
        name: 'Búho de Anteojos',
        title: 'Oráculo de la Noche Estrellada de San Agustín',
        avatar: '🦉',
        maxHealth: 650,
        baseDamage: 27,
        speed: 7.5,
        colorHex: 0x312e81,
        glowColor: 0xa855f7,
        element: 'thunder',
        introQuote: 'Las sombras de los monolitos ven más allá de tu alma...',
        defeatQuote: 'Has iluminado los secretos de las tumbas sagradas...',
        rewardCoins: 700,
        rewardGems: 70,
        phase1: {
            telegraphDuration: 0.75,
            recoveryDuration: 0.55,
            attacks: [
                {
                    id: 'silent_strike',
                    name: 'Vuelo Silencioso en Picada',
                    type: 'dive',
                    damageMult: 1.25,
                    range: 11.0,
                    cooldown: 2.8,
                    voice: 'light'
                },
                {
                    id: 'hypno_orb',
                    name: 'Esferas Hipnóticas Celestiales',
                    type: 'projectile',
                    damageMult: 1.15,
                    range: 13.0,
                    cooldown: 2.6,
                    voice: 'light'
                }
            ]
        },
        phase2: {
            triggerHpPercent: 0.60,
            transitionDuration: 1.6,
            speedMult: 1.3,
            telegraphDuration: 0.5,
            recoveryDuration: 0.4,
            enragedRoarText: '¡Oscuridad Ancestral de San Agustín!',
            attacks: [
                {
                    id: 'astral_vortex',
                    name: 'Vórtice Astral de Sombras',
                    type: 'shockwave',
                    damageMult: 1.7,
                    range: 10.5,
                    cooldown: 3.8,
                    voice: 'heavy'
                },
                {
                    id: 'phantom_illusion',
                    name: 'Proyección de Clones Ilusorios',
                    type: 'barrage',
                    damageMult: 1.55,
                    range: 14.0,
                    cooldown: 3.5,
                    voice: 'light'
                }
            ]
        }
    },
    10: {
        id: 'guardian',
        worldNum: 10,
        name: 'Guardián Ancestral Quimbaya',
        title: 'Titán Precolombino de Oro y Tierradentro',
        avatar: '👑',
        maxHealth: 850,
        baseDamage: 32,
        speed: 7.2,
        colorHex: 0xf59e0b,
        glowColor: 0xffffff,
        element: 'gold',
        introQuote: '¡Soy el espíritu eterno de la leyenda de El Dorado!',
        defeatQuote: 'Colombia tiene a su mayor campeón... ¡Gloria al Guerrero Ninja!',
        rewardCoins: 1200,
        rewardGems: 150,
        phase1: {
            telegraphDuration: 0.8,
            recoveryDuration: 0.55,
            attacks: [
                {
                    id: 'solar_beam',
                    name: 'Rayo Solar Quimbaya',
                    type: 'projectile',
                    damageMult: 1.3,
                    range: 16.0,
                    cooldown: 2.8,
                    voice: 'heavy'
                },
                {
                    id: 'golden_rush',
                    name: 'Embestida de Oro Forjado',
                    type: 'charge',
                    damageMult: 1.4,
                    speed: 16.0,
                    range: 13.0,
                    cooldown: 3.2,
                    voice: 'heavy'
                },
                {
                    id: 'jade_stomp',
                    name: 'Pisada de Jade Titánica',
                    type: 'shockwave',
                    damageMult: 1.3,
                    range: 7.0,
                    cooldown: 2.6,
                    voice: 'heavy'
                }
            ]
        },
        phase2: {
            triggerHpPercent: 0.60,
            transitionDuration: 2.0,
            speedMult: 1.4,
            telegraphDuration: 0.48,
            recoveryDuration: 0.35,
            enragedRoarText: '¡SOBRECARGA DEL ALTAR SAGRADO DE EL DORADO!',
            attacks: [
                {
                    id: 'ancestral_cataclysm',
                    name: 'Cataclismo Solar Quimbaya',
                    type: 'shockwave',
                    damageMult: 2.0,
                    range: 12.0,
                    cooldown: 4.5,
                    voice: 'heavy'
                },
                {
                    id: 'combo_flurry',
                    name: 'Furia de los Tres Espíritus',
                    type: 'charge',
                    damageMult: 1.8,
                    speed: 20.0,
                    range: 18.0,
                    cooldown: 3.8,
                    voice: 'heavy'
                },
                {
                    id: 'relic_barrage',
                    name: 'Lluvia de Reliquias Doradas',
                    type: 'barrage',
                    damageMult: 1.6,
                    range: 15.0,
                    cooldown: 3.2,
                    voice: 'light'
                }
            ]
        }
    }
};
