import './style.css';
import { Map, Tile, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Vector as VectorLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { createXYZ } from 'ol/tilegrid';
import TileWMS from 'ol/source/TileWMS.js';
import { Text, Fill, Stroke, Style } from 'ol/style';
import Graticule from 'ol/layer/Graticule';
import CircleStyle from 'ol/style/Circle';
import { Heatmap as HeatmapLayer} from 'ol/layer.js';


const classes_coropletico = [[0.0, 0.0105], [0.0106, 0.0333], [0.0334, 0.07143], [0.07144, 0.1333], [0.1334, 0.25]];

const estilo_funcao = function (feature) {
  const texto = new Text({
    font: '13px Calibri,sans-serif',
    fill: new Fill({ color: 'red' }),
    stroke: new Stroke({
      color: '#fff',
      width: 4,
    }),
    text: feature.get('nome'),
  });
  const estilo1 = new Style({
    stroke: new Stroke({ color: 'black', width: 0.1 }),
    fill: new Fill({ color: '#feedde' }),
    text: texto,
  });
  const estilo2 = new Style({
    stroke: new Stroke({ color: 'black', width: 0.1 }),
    fill: new Fill({ color: '#fdbe85' }),
    text: texto,
  });
  const estilo3 = new Style({
    stroke: new Stroke({ color: 'black', width: 0.1 }),
    fill: new Fill({ color: '#fd8d3c' }),
    text: texto,
  });
  const estilo4 = new Style({
    stroke: new Stroke({ color: 'black', width: 0.1 }),
    fill: new Fill({ color: '#e6550d' }),
    text: texto,
  });
  const estilo5 = new Style({
    stroke: new Stroke({ color: 'black', width: 0.1 }),
    fill: new Fill({ color: '#a63603' }),
    text: texto,
  });

  let valor_atributo1 = feature.get('tt_rural');
  let valor_atributo2 = feature.get('tt_familias_rural');
  let valor_fenomeno = valor_atributo2 > 0 ? valor_atributo1 / valor_atributo2 : 0;

  if (valor_atributo2 > 0) {
    valor_fenomeno = valor_atributo1 / valor_atributo2;
  }
  if (valor_fenomeno >= classes_coropletico[0][0] && valor_fenomeno < classes_coropletico[0][1]) {
    return estilo1;
  }
  if (valor_fenomeno >= classes_coropletico[1][0] && valor_fenomeno < classes_coropletico[1][1]) {
    return estilo2;
  }
  if (valor_fenomeno >= classes_coropletico[2][0] && valor_fenomeno < classes_coropletico[2][1]) {
    return estilo3;
  }
  if (valor_fenomeno >= classes_coropletico[3][0] && valor_fenomeno < classes_coropletico[3][1]) {
    return estilo4;
  }
  if (valor_fenomeno >= classes_coropletico[4][0] && valor_fenomeno <= classes_coropletico[4][1]) {
    return estilo5;
  }
}

///// criacao da legenda
var cores = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'];
var container_legenda = document.getElementById('descricao_coropletico');
var titulo_legenda = document.createElement('h3');
titulo_legenda.innerText = 'Legenda';
container_legenda.appendChild(titulo_legenda);
var legenda = document.createElement('table');
legenda.style = 'background-color:white';

for (let i = 0; i < classes_coropletico.length; i++) {
  let linha = document.createElement('tr');
  let limite = document.createElement('td');
  limite.innerText = classes_coropletico[i][0].toString() + ' - ' + classes_coropletico[i][1].toString();
  linha.appendChild(limite);
  let cor = document.createElement('td');
  cor.style = 'background-color:' + cores[i] + '; min-width:20px';
  linha.appendChild(cor);
  legenda.appendChild(linha);
}
container_legenda.appendChild(legenda);

const visualizacao = new View({
  projection: 'EPSG:4326',
  center: [0, 0],
  zoom: 2,
});

const osm_layer = new TileLayer({
  source: new OSM()
});

const map = new Map({
  target: 'mapa1',
  layers: [osm_layer],
  view: visualizacao,
});


const fonte_geojson = new VectorSource({
  features: new GeoJSON().readFeatures(conflitos),
});

const layer_geojson = new VectorLayer({
  source: fonte_geojson,
  style: estilo_funcao,
});

map.addLayer(layer_geojson);

const layer_quadricula = new Graticule({
  strokeStyle: new Stroke({
    color: '#636363',
    width: 0.5,
  }),
  showLabels: true,
});

map.addLayer(layer_quadricula);

const fonteDoLayer = layer_geojson.getSource();
const extent = fonteDoLayer.getExtent();
map.getView().fit(extent);

var estilo_basemapbranco = new Style({
  stroke: new Stroke({ color: 'black', width: 0.1 }),
  fill: new Fill({ color: 'white' }),
});

let basemap_branco_source = fonte_geojson;

const basemap_branco = new VectorLayer({
  source: basemap_branco_source,
});

basemap_branco.setStyle(estilo_basemapbranco);

const visualizacao2 = new View({
  projection: 'EPSG:4326',
  center: [0, 0],
  zoom: 2,
})

const sourceWms = new TileWMS({
  url: 'https://geoserver.pr.gov.br/seoserver/wms',
  params: { 'LAYERS': 'itcg:municipiospr-pol_p29292_e3000_a2013', 'EPSG': '4326', 'TILED': true },
  serverType: 'geoserver',
});

const layer_wms = new TileLayer({
  source: sourceWms,
});

const map2 = new Map({
  target: 'mapa2',
  layers: [new TileLayer({
    source: new OSM()
  }), basemap_branco],
  view: visualizacao2,
});

map2.getView().fit(extent);


const estilo_ponto = function (feature) {
  let valor = feature.get('tt_rural');
  let raio = 50 * Math.pow(valor / 13, 0.57);

  let texto = new Text({
    font: '13px Calibri,sans-serif',
    fill: new Fill({ color: '#000', }),
    stroke: new Stroke({ color: '#fff', width: 4 }),
    offsetX: 10,
    offsetY: 10,
    text: valor.toString(),
  });

  let pointStyle = new Style({
    image: new CircleStyle({
      radius: raio,
      fill: new Fill({ color: '#7c120e' }),
      stroke: new Stroke({ color: '#5c5c5c', width: 2 }),
    }),
    text: texto,
  });

  if (valor != 0) {
    return pointStyle;
  }
};

const fonte_geojson2 = new VectorSource({
  features: new GeoJSON().readFeatures(centroides),
});

const layer_geojson2 = new VectorLayer({
  source: fonte_geojson2,
  style: estilo_ponto,
});

map2.addLayer(layer_geojson2);

var visualizacao3 = new View({
  projection: 'EPSG:4326',
  center:[0,0],
  zoom:2
});




var map3 = new Map({
  target: 'mapa3',
  layers: [new TileLayer({
    source: new OSM()
  })],
  view: visualizacao3,
});

map3.getView().fit(extent);

var calor_source = new VectorSource({
  features: new GeoJSON().readFeatures(favelas)
});

var mapadecalor = new HeatmapLayer({
source: calor_source,
blur: 30,
radius:3,
});

map3.addLayer(mapadecalor);
