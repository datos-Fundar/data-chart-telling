// ── Earthquakes in South America, 2000-2025 ─────────────────────────────────
// USGS earthquake catalog (public domain): the 121 events of magnitude 6.5 or
// more with an epicenter between 56 S and 13 N and 82 W and 34 W. Depth in
// kilometers.

export type Earthquake = {
	date: string;
	lon: number;
	lat: number;
	depth: number;
	magnitude: number;
	place: string;
};

export const EARTHQUAKES: Earthquake[] = [
	{
		date: '2000-04-23',
		lon: -62.99,
		lat: -28.307,
		depth: 608,
		magnitude: 7.0,
		place: '22 km NW of Añatuya, Argentina'
	},
	{
		date: '2000-05-12',
		lon: -66.452,
		lat: -23.548,
		depth: 225,
		magnitude: 7.2,
		place: '75 km N of San Antonio de los Cobres, Argentina'
	},
	{
		date: '2000-11-08',
		lon: -77.829,
		lat: 7.042,
		depth: 17,
		magnitude: 6.5,
		place: '10 km SW of Juradó, Colombia'
	},
	{
		date: '2000-12-20',
		lon: -74.662,
		lat: -39.008,
		depth: 11,
		magnitude: 6.5,
		place: '134 km WSW of Carahue, Chile'
	},
	{
		date: '2001-04-09',
		lon: -73.109,
		lat: -32.668,
		depth: 11,
		magnitude: 6.7,
		place: '144 km WNW of Valparaíso, Chile'
	},
	{
		date: '2001-06-23',
		lon: -73.641,
		lat: -16.265,
		depth: 33,
		magnitude: 8.4,
		place: '6 km SSW of Atico, Peru'
	},
	{
		date: '2001-06-26',
		lon: -71.649,
		lat: -17.745,
		depth: 24,
		magnitude: 6.7,
		place: '34 km WSW of Pacocha, Peru'
	},
	{
		date: '2001-07-05',
		lon: -73.987,
		lat: -16.086,
		depth: 62,
		magnitude: 6.6,
		place: '31 km S of Achanizo, Peru'
	},
	{
		date: '2001-07-07',
		lon: -72.077,
		lat: -17.543,
		depth: 33,
		magnitude: 7.6,
		place: '51 km SW of Punta de Bombón, Peru'
	},
	{
		date: '2002-03-28',
		lon: -68.329,
		lat: -21.663,
		depth: 125,
		magnitude: 6.5,
		place: '107 km NE of Calama, Chile'
	},
	{
		date: '2002-04-18',
		lon: -70.586,
		lat: -27.535,
		depth: 62,
		magnitude: 6.7,
		place: '31 km SW of Copiapó, Chile'
	},
	{
		date: '2002-06-18',
		lon: -71.124,
		lat: -30.805,
		depth: 54,
		magnitude: 6.6,
		place: '20 km SW of Monte Patria, Chile'
	},
	{
		date: '2002-10-12',
		lon: -71.738,
		lat: -8.295,
		depth: 534,
		magnitude: 6.9,
		place: '108 km W of Tarauacá, Brazil'
	},
	{
		date: '2003-06-20',
		lon: -71.722,
		lat: -7.606,
		depth: 558,
		magnitude: 7.1,
		place: '105 km E of Cruzeiro do Sul, Brazil'
	},
	{
		date: '2003-06-20',
		lon: -71.637,
		lat: -30.608,
		depth: 33,
		magnitude: 6.8,
		place: '42 km W of Ovalle, Chile'
	},
	{
		date: '2004-05-03',
		lon: -73.406,
		lat: -37.695,
		depth: 21,
		magnitude: 6.6,
		place: '11 km N of Cañete, Chile'
	},
	{
		date: '2004-08-28',
		lon: -70.525,
		lat: -35.173,
		depth: 5,
		magnitude: 6.5,
		place: '67 km ESE of Teno, Chile'
	},
	{
		date: '2004-11-15',
		lon: -77.508,
		lat: 4.695,
		depth: 15,
		magnitude: 7.2,
		place: '32 km SSW of Pizarro, Colombia'
	},
	{
		date: '2005-03-21',
		lon: -63.47,
		lat: -24.983,
		depth: 579,
		magnitude: 6.9,
		place: '67 km ENE of Joaquín V. González, Argentina'
	},
	{
		date: '2005-06-13',
		lon: -69.197,
		lat: -19.987,
		depth: 116,
		magnitude: 7.8,
		place: '102 km ENE of Iquique, Chile'
	},
	{
		date: '2005-09-26',
		lon: -76.398,
		lat: -5.678,
		depth: 115,
		magnitude: 7.5,
		place: '39 km NW of Yurimaguas, Peru'
	},
	{
		date: '2005-11-17',
		lon: -67.895,
		lat: -22.361,
		depth: 147,
		magnitude: 6.8,
		place: '68 km NNE of San Pedro de Atacama, Chile'
	},
	{
		date: '2006-04-30',
		lon: -71.022,
		lat: -27.017,
		depth: 12,
		magnitude: 6.7,
		place: '78 km WNW of Copiapó, Chile'
	},
	{
		date: '2006-04-30',
		lon: -71.056,
		lat: -27.211,
		depth: 12,
		magnitude: 6.5,
		place: '73 km WNW of Copiapó, Chile'
	},
	{
		date: '2006-08-25',
		lon: -67.028,
		lat: -24.403,
		depth: 184,
		magnitude: 6.6,
		place: '74 km WSW of San Antonio de los Cobres, Argentina'
	},
	{
		date: '2006-10-20',
		lon: -76.677,
		lat: -13.457,
		depth: 23,
		magnitude: 6.7,
		place: '52 km SW of San Vicente de Cañete, Peru'
	},
	{
		date: '2006-11-13',
		lon: -63.283,
		lat: -26.052,
		depth: 572,
		magnitude: 6.8,
		place: '48 km S of Taco Pozo, Argentina'
	},
	{
		date: '2007-08-15',
		lon: -76.603,
		lat: -13.386,
		depth: 39,
		magnitude: 8.0,
		place: '41 km SW of San Vicente de Cañete, Peru'
	},
	{
		date: '2007-08-20',
		lon: -39.251,
		lat: 8.037,
		depth: 6,
		magnitude: 6.5,
		place: 'central Mid-Atlantic Ridge'
	},
	{
		date: '2007-09-10',
		lon: -77.963,
		lat: 2.966,
		depth: 15,
		magnitude: 6.8,
		place: '39 km WNW of Timbiquí, Colombia'
	},
	{
		date: '2007-11-14',
		lon: -69.89,
		lat: -22.247,
		depth: 40,
		magnitude: 7.7,
		place: '36 km ESE of Tocopilla, Chile'
	},
	{
		date: '2007-11-15',
		lon: -70.237,
		lat: -22.925,
		depth: 26,
		magnitude: 6.8,
		place: '82 km NNE of Antofagasta, Chile'
	},
	{
		date: '2007-11-16',
		lon: -77.838,
		lat: -2.312,
		depth: 123,
		magnitude: 6.8,
		place: '30 km E of Macas, Ecuador'
	},
	{
		date: '2007-12-16',
		lon: -70.182,
		lat: -22.954,
		depth: 45,
		magnitude: 6.7,
		place: '80 km NNE of Antofagasta, Chile'
	},
	{
		date: '2008-02-08',
		lon: -41.899,
		lat: 10.671,
		depth: 9,
		magnitude: 6.9,
		place: 'northern Mid-Atlantic Ridge'
	},
	{
		date: '2008-05-23',
		lon: -34.897,
		lat: 7.313,
		depth: 8,
		magnitude: 6.5,
		place: 'central Mid-Atlantic Ridge'
	},
	{
		date: '2008-09-10',
		lon: -38.705,
		lat: 8.093,
		depth: 9,
		magnitude: 6.6,
		place: 'central Mid-Atlantic Ridge'
	},
	{
		date: '2009-11-13',
		lon: -70.321,
		lat: -19.394,
		depth: 27,
		magnitude: 6.5,
		place: '92 km N of Iquique, Chile'
	},
	{
		date: '2010-02-27',
		lon: -72.898,
		lat: -36.122,
		depth: 23,
		magnitude: 8.8,
		place: '2010 Maule, Chile Earthquake'
	},
	{
		date: '2010-02-27',
		lon: -75.048,
		lat: -37.773,
		depth: 35,
		magnitude: 7.4,
		place: '124 km W of Lebu, Chile'
	},
	{
		date: '2010-03-05',
		lon: -73.374,
		lat: -36.665,
		depth: 18,
		magnitude: 6.6,
		place: '23 km WNW of Talcahuano, Chile'
	},
	{
		date: '2010-03-11',
		lon: -71.891,
		lat: -34.29,
		depth: 11,
		magnitude: 6.9,
		place: '61 km NW of Santa Cruz, Chile'
	},
	{
		date: '2010-03-11',
		lon: -71.799,
		lat: -34.326,
		depth: 18,
		magnitude: 7.0,
		place: '52 km NW of Santa Cruz, Chile'
	},
	{
		date: '2010-03-16',
		lon: -73.257,
		lat: -36.217,
		depth: 18,
		magnitude: 6.7,
		place: '52 km NNW of Tomé, Chile'
	},
	{
		date: '2010-05-24',
		lon: -71.558,
		lat: -8.087,
		depth: 581,
		magnitude: 6.5,
		place: '87 km W of Tarauacá, Brazil'
	},
	{
		date: '2010-07-14',
		lon: -73.31,
		lat: -38.067,
		depth: 22,
		magnitude: 6.6,
		place: '30 km SSE of Cañete, Chile'
	},
	{ date: '2010-08-12', lon: -77.306, lat: -1.266, depth: 207, magnitude: 7.1, place: 'Ecuador' },
	{
		date: '2011-01-01',
		lon: -63.136,
		lat: -26.803,
		depth: 577,
		magnitude: 7.0,
		place: '26 km NNE of El Hoyo, Argentina'
	},
	{
		date: '2011-01-02',
		lon: -73.326,
		lat: -38.355,
		depth: 24,
		magnitude: 7.2,
		place: '42 km NNW of Carahue, Chile'
	},
	{
		date: '2011-02-11',
		lon: -72.96,
		lat: -36.422,
		depth: 26,
		magnitude: 6.9,
		place: '21 km N of Tomé, Chile'
	},
	{
		date: '2011-02-14',
		lon: -72.834,
		lat: -35.38,
		depth: 21,
		magnitude: 6.7,
		place: '38 km W of Constitución, Chile'
	},
	{
		date: '2011-08-24',
		lon: -74.525,
		lat: -7.641,
		depth: 147,
		magnitude: 7.0,
		place: '64 km ESE of Contamana, Peru'
	},
	{
		date: '2011-09-02',
		lon: -63.029,
		lat: -28.398,
		depth: 579,
		magnitude: 6.7,
		place: '20 km WNW of Añatuya, Argentina'
	},
	{
		date: '2011-10-28',
		lon: -75.966,
		lat: -14.438,
		depth: 24,
		magnitude: 6.9,
		place: '39 km SW of Santiago, Peru'
	},
	{
		date: '2011-11-22',
		lon: -65.09,
		lat: -15.364,
		depth: 550,
		magnitude: 6.6,
		place: '62 km SSW of Trinidad, Bolivia'
	},
	{
		date: '2012-03-25',
		lon: -72.217,
		lat: -35.2,
		depth: 41,
		magnitude: 7.1,
		place: '23 km NE of Constitución, Chile'
	},
	{
		date: '2012-04-17',
		lon: -71.365,
		lat: -32.625,
		depth: 29,
		magnitude: 6.7,
		place: '22 km NW of Hacienda La Calera, Chile'
	},
	{
		date: '2012-05-28',
		lon: -63.094,
		lat: -28.043,
		depth: 587,
		magnitude: 6.7,
		place: '35 km ESE of Suncho Corral, Argentina'
	},
	{
		date: '2012-09-30',
		lon: -76.362,
		lat: 1.929,
		depth: 170,
		magnitude: 7.3,
		place: '11 km WNW of San Agustín, Colombia'
	},
	{
		date: '2013-01-30',
		lon: -70.653,
		lat: -28.094,
		depth: 45,
		magnitude: 6.8,
		place: '54 km N of Vallenar, Chile'
	},
	{
		date: '2013-02-09',
		lon: -77.393,
		lat: 1.135,
		depth: 145,
		magnitude: 6.9,
		place: '2 km NNE of Yacuanquer, Colombia'
	},
	{
		date: '2013-06-24',
		lon: -42.594,
		lat: 10.701,
		depth: 10,
		magnitude: 6.6,
		place: 'northern Mid-Atlantic Ridge'
	},
	{
		date: '2013-08-13',
		lon: -78.1999,
		lat: 5.7732,
		depth: 12,
		magnitude: 6.7,
		place: '101 km WSW of Bahía Solano, Colombia'
	},
	{
		date: '2013-09-25',
		lon: -74.5112,
		lat: -15.8385,
		depth: 40,
		magnitude: 7.1,
		place: '16 km WSW of Atiquipa, Peru'
	},
	{
		date: '2013-10-31',
		lon: -71.5215,
		lat: -30.2921,
		depth: 27,
		magnitude: 6.6,
		place: '41 km SSW of Coquimbo, Chile'
	},
	{
		date: '2013-11-25',
		lon: -55.0033,
		lat: -53.9451,
		depth: 12,
		magnitude: 7.0,
		place: 'Falkland Islands region'
	},
	{
		date: '2014-03-16',
		lon: -70.7022,
		lat: -19.9807,
		depth: 20,
		magnitude: 6.7,
		place: '63 km WNW of Iquique, Chile'
	},
	{
		date: '2014-04-01',
		lon: -70.7691,
		lat: -19.6097,
		depth: 25,
		magnitude: 8.2,
		place: '93 km NW of Iquique, Chile'
	},
	{
		date: '2014-04-01',
		lon: -70.9455,
		lat: -19.8927,
		depth: 28,
		magnitude: 6.9,
		place: '90 km WNW of Iquique, Chile'
	},
	{
		date: '2014-04-03',
		lon: -70.5756,
		lat: -20.3113,
		depth: 24,
		magnitude: 6.5,
		place: '45 km WSW of Iquique, Chile'
	},
	{
		date: '2014-04-03',
		lon: -70.4931,
		lat: -20.5709,
		depth: 22,
		magnitude: 7.7,
		place: '53 km SW of Iquique, Chile'
	},
	{
		date: '2014-08-24',
		lon: -73.5714,
		lat: -14.598,
		depth: 101,
		magnitude: 6.8,
		place: '38 km NW of Aniso, Peru'
	},
	{
		date: '2015-02-11',
		lon: -66.688,
		lat: -23.1125,
		depth: 223,
		magnitude: 6.7,
		place: '103 km W of El Aguilar, Argentina'
	},
	{
		date: '2015-09-16',
		lon: -71.6744,
		lat: -31.5729,
		depth: 22,
		magnitude: 8.3,
		place: '48 km W of Illapel, Chile'
	},
	{
		date: '2015-09-16',
		lon: -71.4262,
		lat: -31.5622,
		depth: 28,
		magnitude: 7.0,
		place: '25 km WNW of Illapel, Chile'
	},
	{
		date: '2015-09-17',
		lon: -71.6876,
		lat: -31.4244,
		depth: 27,
		magnitude: 6.5,
		place: '54 km WNW of Illapel, Chile'
	},
	{
		date: '2015-09-17',
		lon: -71.804,
		lat: -31.5173,
		depth: 23,
		magnitude: 6.7,
		place: '61 km WNW of Illapel, Chile'
	},
	{
		date: '2015-09-21',
		lon: -71.3792,
		lat: -31.7275,
		depth: 35,
		magnitude: 6.6,
		place: '22 km WSW of Illapel, Chile'
	},
	{
		date: '2015-11-07',
		lon: -71.4519,
		lat: -30.8796,
		depth: 46,
		magnitude: 6.8,
		place: '39 km SW of Ovalle, Chile'
	},
	{
		date: '2015-11-11',
		lon: -72.0068,
		lat: -29.5067,
		depth: 12,
		magnitude: 6.9,
		place: '81 km NW of Coquimbo, Chile'
	},
	{
		date: '2015-11-11',
		lon: -72.0585,
		lat: -29.5097,
		depth: 10,
		magnitude: 6.9,
		place: '85 km NW of Coquimbo, Chile'
	},
	{
		date: '2015-11-24',
		lon: -70.9437,
		lat: -10.5372,
		depth: 606,
		magnitude: 7.6,
		place: '155 km WNW of Iñapari, Peru'
	},
	{
		date: '2015-11-24',
		lon: -71.0184,
		lat: -10.0598,
		depth: 621,
		magnitude: 7.6,
		place: '185 km WNW of Iñapari, Peru'
	},
	{
		date: '2015-11-26',
		lon: -71.2574,
		lat: -9.1825,
		depth: 603,
		magnitude: 6.7,
		place: '125 km SSW of Tarauacá, Brazil'
	},
	{
		date: '2016-04-16',
		lon: -79.9218,
		lat: 0.3819,
		depth: 21,
		magnitude: 7.8,
		place: '27 km SSE of Muisne, Ecuador'
	},
	{
		date: '2016-05-18',
		lon: -79.7899,
		lat: 0.4261,
		depth: 16,
		magnitude: 6.7,
		place: '32 km SE of Muisne, Ecuador'
	},
	{
		date: '2016-05-18',
		lon: -79.616,
		lat: 0.4947,
		depth: 30,
		magnitude: 6.9,
		place: '24 km NW of Rosa Zarate, Ecuador'
	},
	{
		date: '2016-12-25',
		lon: -73.9413,
		lat: -43.4064,
		depth: 38,
		magnitude: 7.6,
		place: '41 km SW of Quellón, Chile'
	},
	{
		date: '2017-02-21',
		lon: -63.9047,
		lat: -19.2814,
		depth: 596,
		magnitude: 6.5,
		place: '41 km E of Padilla, Bolivia'
	},
	{
		date: '2017-04-24',
		lon: -72.0617,
		lat: -33.0375,
		depth: 28,
		magnitude: 6.9,
		place: '40 km W of Valparaíso, Chile'
	},
	{
		date: '2018-01-14',
		lon: -74.7092,
		lat: -15.7675,
		depth: 39,
		magnitude: 7.1,
		place: '37 km W of Atiquipa, Peru'
	},
	{
		date: '2018-04-02',
		lon: -63.0058,
		lat: -20.6588,
		depth: 559,
		magnitude: 6.8,
		place: '38 km SE of Boyuibe, Bolivia'
	},
	{
		date: '2018-08-21',
		lon: -62.9019,
		lat: 10.7731,
		depth: 147,
		magnitude: 7.3,
		place: '40 km ENE of Carúpano, Venezuela'
	},
	{
		date: '2018-08-24',
		lon: -70.8284,
		lat: -11.0355,
		depth: 630,
		magnitude: 7.1,
		place: '136 km W of Iñapari, Peru'
	},
	{
		date: '2019-01-05',
		lon: -71.587,
		lat: -8.144,
		depth: 570,
		magnitude: 6.8,
		place: '90 km W of Tarauacá, Brazil'
	},
	{
		date: '2019-01-20',
		lon: -71.3815,
		lat: -30.0404,
		depth: 63,
		magnitude: 6.7,
		place: '10 km SSW of Coquimbo, Chile'
	},
	{
		date: '2019-02-22',
		lon: -77.0505,
		lat: -2.1862,
		depth: 145,
		magnitude: 7.5,
		place: '115 km ESE of Palora, Ecuador'
	},
	{
		date: '2019-03-01',
		lon: -70.1546,
		lat: -14.7131,
		depth: 267,
		magnitude: 7.0,
		place: '22 km NNE of Azángaro, Peru'
	},
	{
		date: '2019-05-26',
		lon: -75.2697,
		lat: -5.8119,
		depth: 123,
		magnitude: 8.0,
		place: '78 km NE of Navarro, Peru'
	},
	{
		date: '2019-08-01',
		lon: -72.3102,
		lat: -34.2364,
		depth: 25,
		magnitude: 6.8,
		place: '96 km SW of San Antonio, Chile'
	},
	{
		date: '2019-09-29',
		lon: -73.163,
		lat: -35.4758,
		depth: 11,
		magnitude: 6.7,
		place: '70 km WSW of Constitución, Chile'
	},
	{
		date: '2020-06-03',
		lon: -68.4677,
		lat: -23.274,
		depth: 112,
		magnitude: 6.8,
		place: '48 km SW of San Pedro de Atacama, Chile'
	},
	{
		date: '2020-09-01',
		lon: -71.3062,
		lat: -27.9686,
		depth: 21,
		magnitude: 6.8,
		place: '86 km NW of Vallenar, Chile'
	},
	{
		date: '2020-09-01',
		lon: -71.3701,
		lat: -27.9162,
		depth: 16,
		magnitude: 6.5,
		place: '94 km NW of Vallenar, Chile'
	},
	{
		date: '2020-09-06',
		lon: -37.1544,
		lat: 7.6829,
		depth: 10,
		magnitude: 6.7,
		place: 'central Mid-Atlantic Ridge'
	},
	{
		date: '2020-12-27',
		lon: -74.9849,
		lat: -39.3398,
		depth: 10,
		magnitude: 6.7,
		place: '146 km WNW of Corral, Chile'
	},
	{
		date: '2021-11-28',
		lon: -76.8126,
		lat: -4.4667,
		depth: 126,
		magnitude: 7.5,
		place: '43 km NNW of Barranca, Peru'
	},
	{
		date: '2022-02-03',
		lon: -76.9283,
		lat: -4.4661,
		depth: 110,
		magnitude: 6.5,
		place: '49 km NW of Barranca, Peru'
	},
	{
		date: '2022-03-22',
		lon: -43.382,
		lat: 10.7447,
		depth: 10,
		magnitude: 6.7,
		place: 'northern Mid-Atlantic Ridge'
	},
	{
		date: '2022-05-10',
		lon: -66.6519,
		lat: -23.496,
		depth: 220,
		magnitude: 6.8,
		place: '86 km NNW of San Antonio de los Cobres, Argentina'
	},
	{
		date: '2022-05-26',
		lon: -70.2924,
		lat: -14.9076,
		depth: 236,
		magnitude: 7.2,
		place: '10 km W of Azángaro, Peru'
	},
	{
		date: '2022-06-08',
		lon: -71.1783,
		lat: -9.0472,
		depth: 623,
		magnitude: 6.5,
		place: '107 km SSW of Tarauacá, Brazil'
	},
	{
		date: '2023-01-20',
		lon: -63.0824,
		lat: -26.7506,
		depth: 597,
		magnitude: 6.8,
		place: '29 km SW of Campo Gallo, Argentina'
	},
	{
		date: '2023-03-18',
		lon: -79.8518,
		lat: -2.7834,
		depth: 68,
		magnitude: 6.8,
		place: '14 km NNW of Baláo, Ecuador'
	},
	{
		date: '2023-05-25',
		lon: -77.0904,
		lat: 8.9223,
		depth: 13,
		magnitude: 6.5,
		place: '45 km NE of Puerto Obaldía, Panama'
	},
	{
		date: '2023-07-17',
		lon: -70.4427,
		lat: -38.1862,
		depth: 186,
		magnitude: 6.6,
		place: '19 km SE of Loncopué, Argentina'
	},
	{
		date: '2023-10-31',
		lon: -71.5573,
		lat: -28.7431,
		depth: 34,
		magnitude: 6.6,
		place: '80 km WSW of Vallenar, Chile'
	},
	{
		date: '2024-01-20',
		lon: -71.464,
		lat: -7.2879,
		depth: 607,
		magnitude: 6.6,
		place: '123 km NW of Tarauacá, Brazil'
	},
	{
		date: '2024-01-28',
		lon: -71.4005,
		lat: -8.236,
		depth: 621,
		magnitude: 6.5,
		place: '70 km W of Tarauacá, Brazil'
	},
	{
		date: '2024-06-28',
		lon: -74.454,
		lat: -15.8277,
		depth: 24,
		magnitude: 7.2,
		place: '10 km WSW of Atiquipa, Peru'
	},
	{
		date: '2024-07-19',
		lon: -67.8404,
		lat: -23.0791,
		depth: 127,
		magnitude: 7.4,
		place: '41 km ESE of San Pedro de Atacama, Chile'
	}
];
