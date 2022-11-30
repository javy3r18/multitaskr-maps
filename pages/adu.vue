<template>
  <b-container fluid>
    <b-row>
      <b-col cols="2">
        <div>
          <b-button @click="addFloor" variant="outline-primary"
            >Set adu</b-button
          >
          <b-button v-if="aduExist" @click="add3DModel" variant="outline-primary"
            >3D view</b-button
          >
          <b-button v-if="aduExist" @click="moveFloor" variant="outline-primary"
            >Move adu</b-button
          >
        </div>
        <div v-if="aduExist">
          <p>Rotate</p>
          <b-form-input
            id="range"
            v-model="rotation"
            type="range"
            min="0"
            max="360"
          ></b-form-input>
          <p>Degrees:</p>
          <b-form-input v-model="rotation" style="width: 25%"></b-form-input>
        </div>

        <div v-if="aduExist">
            <b-alert
              v-if="aduStatePosition"
              class="alert"
              show
              variant="success"
              >Well done Peter, I couldn't do it without you</b-alert
            >
            <b-alert
              v-if="!aduStatePosition"
              class="alert"
              show
              variant="danger"
              >Can't build the ADU here. Feasibility problem.</b-alert
            >
        </div>
      </b-col>
      <b-col cols="10">
        <div id="map"></div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { Threebox } from "threebox-plugin";
export default {
  data() {
    return {
      access_token:
        "pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g",
      map: {},
      coordinates: {
        lng: this.$route.query.lng,
        lat: this.$route.query.lat,
      },
      parcelFeatures: null,
      firstPolygon: null,
      newPolyCenter: null,
      aduExist: false,
      switch3D: true,
      rotation: 0,
      currentModel: null,
      aduStatePosition: false
    };
  },

  mounted() {
    this.createMap();
    this.isMapLoaded();
  },

  methods: {
    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/javy3r18/clb4080ba000114s0cjaoxg6v",
        zoom: 17,
        pitch: 45, //inclination
        bearing: -17, // rotation
        center: [-117.157268, 32.713888],
        antialias: true,
      });
    },

    isMapLoaded() {
      this.map.on("load", () => {
        this.map.setCenter(this.coordinates);
        this.initParcelTileset();
        this.getParcelFeatures();


        this.map.on('click', 'citysandiego', (e) => {
            this.coordinates = e.lngLat;
            let features = this.map.queryRenderedFeatures(e.point, {layers: ['citysandiego']})
            console.log(features);
            this.parcelFeatures = features[0];
            this.selectedParcel()
        })
      });
    },

    getParcelFeatures() {
      let point = this.map.project(this.coordinates);
      this.map.once("idle", () => {
        let parcel = this.map.queryRenderedFeatures(point, {
          layers: ["citysandiego"],
        });
        console.log(parcel);
        this.parcelFeatures = parcel[0];
        this.selectedParcel();
      });
    },

    getBuildingFeatures(parcelCoordinates) {
      let features = this.map.queryRenderedFeatures({
        layers: ["building"],
      });
      let poly = this.$turf.polygon([parcelCoordinates]);
      this.filterBuildingFeatures = [];
      let buildingCoordinates = null;
      features.forEach((element) => {
        if (element.geometry.coordinates.length > 1) {
          //Se hace si el feature regresa un multipolygon
          element.geometry.coordinates.forEach((subelement) => {
            buildingCoordinates = subelement;
            let poly2 = this.$turf.polygon([buildingCoordinates[0]]); //Se guarda cada uno de los polygonos dentro del multipolygon
            let intersection = this.$turf.intersect(poly, poly2);
            if (intersection) {
              this.filterBuildingFeatures.push(
                intersection.geometry.coordinates
              );
            }
          });
        } else {
          buildingCoordinates = element.geometry.coordinates;
          let poly2 = this.$turf.polygon([buildingCoordinates[0]]);
          let intersection = this.$turf.intersect(poly, poly2);
          if (intersection && intersection.geometry.coordinates.length > 1) {
            //Se hace si el intersection regresa un multipolygon
            intersection.geometry.coordinates.forEach((element) => {
              this.filterBuildingFeatures.push(element);
            });
          } else if (intersection) {
            this.filterBuildingFeatures.push(intersection.geometry.coordinates);
          }
        }
      });
      console.log(this.filterBuildingFeatures);

      if(this.map.getSource('buildingPolygon')){
        this.map.removeLayer('buildingLine')
        this.map.removeSource('buildingPolygon')
      }

    buildingCoordinates = this.filterBuildingFeatures[0]
    console.log(buildingCoordinates);
      if(buildingCoordinates){
        this.map.addSource("buildingPolygon", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [buildingCoordinates[0]],
          },
        },
      });

      this.map.addLayer({
        id: "buildingLine",
        type: "line",
        source: "buildingPolygon",
        layout: {},
        minzoom: 16.5,
        paint: {
          "line-color": "black",
          "line-width": 2,
        },
      });
      }
    },

    selectedParcel() {
      console.log(this.parcelFeatures);
      let parcelCoordinates = this.parcelFeatures.geometry.coordinates[0];
      let poly = this.$turf.polygon([parcelCoordinates]);
      let bbox = this.$turf.bbox(poly);
      console.log(bbox);
      this.map.fitBounds(bbox, {
        padding: 120,
      });

      this.map.once("moveend", () => {
        this.getBuildingFeatures(parcelCoordinates);
      });
    },

    initParcelTileset() {
      this.map.addSource("parcelsTileset", {
        type: "vector",
        url: "mapbox://multitaskr.citysandiego",
        generateId: true,
      });

      this.map.addLayer({
        id: "citysandiego",
        generateId: true,
        source: "parcelsTileset",
        "source-layer": "citysandiego",
        type: "fill",
        minzoom: 16.5,
        paint: {
          "fill-color": "white",
          "fill-opacity": 0.2,
        },
      });

      this.map.addLayer({
        id: "parcelLine",
        "source-layer": "citysandiego",
        type: "line",
        source: "parcelsTileset",
        layout: {},
        minzoom: 16.5,
        paint: {
          "line-dasharray": [4, 4],
          "line-color": "black",
          "line-width": 2,
        },
      });
    },

    addFloor() {
      if (this.map.getSource("floor")) {
        this.map.removeLayer("floorLayer");
        this.map.removeSource("floor");
      }
      if (this.map.getLayer("custom_layer"))
        this.map.removeLayer("custom_layer");
      var poly = this.$turf.polygon([
        [
          [-117.04397491402744, 32.54900563224241],
          [-117.04397491402744, 32.5489504192723],
          [-117.04390584476576, 32.5489504192723],
          [-117.04390584476576, 32.54900563224241],
          [-117.04397491402744, 32.54900563224241],
        ],
      ]);
      var center = this.$turf.centroid(poly);
      var from = this.$turf.point([
        center.geometry.coordinates[0],
        center.geometry.coordinates[1],
      ]);
      this.newPolyCenter = this.$turf.point([
        this.coordinates.lng,
        this.coordinates.lat,
      ]);
      var bearing = this.$turf.rhumbBearing(from, this.newPolyCenter);
      var distance = this.$turf.rhumbDistance(from, this.newPolyCenter);
      this.firstPolygon = this.$turf.transformTranslate(
        poly,
        distance,
        bearing
      );
      this.map.addSource("floor", {
        type: "geojson",
        data: this.firstPolygon,
      });
      this.map.addLayer({
        id: "floorLayer",
        type: "fill",
        source: "floor",
        paint: {
          "fill-color": "grey",
        },
        layout: {},
      });
      this.aduExist = true;
      this.verifyAduSpace(this.firstPolygon);
    },

    verifyAduSpace(currentPolygon) {
      let poly2 = this.$turf.polygon([currentPolygon.geometry.coordinates[0]]);
      let poly3 = this.$turf.polygon([
        this.parcelFeatures.geometry.coordinates[0],
      ]);
      let difference = this.$turf.difference(poly2, poly3);
      let finishLoop = false;

      this.filterBuildingFeatures.forEach((element) => {
        if (!finishLoop) {
          let poly = this.$turf.polygon([element[0]]);
          let intersection = this.$turf.intersect(poly, poly2);
          if (intersection != null || difference != null) {
            this.map.setPaintProperty("floorLayer", "fill-color", "red");
            this.aduStatePosition = false;
            finishLoop = true;
            return;
          } else {
            this.map.setPaintProperty("floorLayer", "fill-color", "green");
            this.aduStatePosition = true;
          }
        }
      });
    },

    add3DModel() {
      if (this.switch3D) {
        this.switch3D = false;
        this.map.addLayer({
          id: "custom_layer",
          type: "custom",
          renderingMode: "3d",
          onAdd: (map, gl) => {
            window.tb = new Threebox(map, gl, { defaultLights: true });
            let options = {
              obj: "./model/example.fbx",
              type: "fbx",
              scale: 0.02,
              units: "meters",
              anchor: "center",
              rotation: { x: 90, y: 0, z: 0 }, //default rotation
            };
            tb.loadObj(options, (model) => {
              this.currentModel = model;
              let adu = this.currentModel.setCoords(
                this.newPolyCenter.geometry.coordinates
              );
              tb.add(adu);
              console.log(this.currentModel);
              this.currentModel.setRotation({ x: 0, y: 0, z: -this.rotation });
            });
          },
          render: function (gl, matrix) {
            tb.update();
          },
        });
      } else {
        this.map.removeLayer("custom_layer");
        this.switch3D = true;
      }
    },

    moveFloor() {
      let stop = true;
      this.map.on("mousemove", "citysandiego", (e) => {
        if (stop) {
          var center = this.$turf.centroid(this.firstPolygon);
          var from = this.$turf.point([
            center.geometry.coordinates[0],
            center.geometry.coordinates[1],
          ]);
          this.newPolyCenter = this.$turf.point([e.lngLat.lng, e.lngLat.lat]);
          var bearing = this.$turf.rhumbBearing(from, this.newPolyCenter);
          var distance = this.$turf.rhumbDistance(from, this.newPolyCenter);
          this.firstPolygon = this.$turf.transformTranslate(
            this.firstPolygon,
            distance,
            bearing
          );
          this.map.getSource("floor").setData(this.firstPolygon);
          if (!this.switch3D)
            this.currentModel.setCoords([e.lngLat.lng, e.lngLat.lat]);
        }
      });
      this.map.once("click", () => {
        stop = false;
        this.verifyAduSpace(this.firstPolygon);
      });
    },
  },

  watch: {
    rotation: function (value) {
      let degrees = +value;
      var center = this.$turf.centroid(this.firstPolygon);
      var options = {
        pivot: [center.geometry.coordinates[0], center.geometry.coordinates[1]],
      };
      let rotatedPoly = this.$turf.transformRotate(
        this.firstPolygon,
        degrees,
        options
      );
      this.map.getSource("floor").setData(rotatedPoly);
      if (!this.switch3D) this.currentModel.setRotation({ x: 0, y: 0, z: -degrees });

      this.verifyAduSpace(rotatedPoly);
    },
}
};
</script>

<style>
#map {
  width: 100%;
  height: 100vh;
}
</style>
