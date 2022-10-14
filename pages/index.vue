<template>
  <b-container fluid class="m-0 p-0">
    <b-row>
      <b-col>
        <div class="m-3">
          <form class="d-flex flex-column">
            <input
              v-model="inputs.address"
              class="my-2"
              name="address"
              placeholder="Address"
              type="text"
              autocomplete="address-line1"
            />
          </form>
        </div>
        <div class="m-3">
          <b-button
            style="background-color: #4e04af"
            @click="
              map.setStyle('mapbox://styles/javy3r18/cl8yrxo04000014py4v4pmavh')
            "
            >Multitakr Style</b-button
          >
          <b-button
            @click="
              map.setStyle(
                'mapbox://styles/elgerardo/cl8yrf6l1000e15o68btt9hgi'
              )
            "
            >Normal Style</b-button
          >
          <b-button
            @click="
              map.setStyle(
                'mapbox://styles/soloskilos/cl8ywrz0j000l14mrphfgsifg'
              )
            "
            >Satelite</b-button
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
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      access_token:
        "pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g",
      map: {},
      marker: {},
      search: {},
      inputs: {
        address: null,
      },
      coordinates: {
        lng: -117.04342,
        lat: 32.55252,
      },
      polygon: null,
      geojsonArrays: [],
      hoveredStateId: null,
    };
  },

  mounted() {
    this.createMap();
    this.setNewMarker();
    this.setAutoFill();
  },

  computed: {
    ...mapGetters({
      items: "locations/items",
      hoverlocation: "locationhover/items",
      geojson: "geojson/geojson",
      polygons: "polygons/polygons",
    }),
  },

  methods: {
    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: 16,
        center: this.coordinates,
      });

      this.map.on("click", "building", async (event) => {
        let params = {
          lat: event.lngLat.lat,
          lng: event.lngLat.lng,
        };
        await this.$store.dispatch("polygons/get", params);
        let geojson = JSON.parse(this.polygons.geojson);
        let parseJson = geojson.coordinates[0];
        this.filterData(parseJson);
        this.addParcel(this.geojsonArrays);
        this.buildingZoom(this.geojsonArrays);
      });

      this.map.on("load", () => {

        let description = null
        this.map.removeLayer("building");

        this.map.addSource("mapbox-streets", {
          type: "vector",
          url: "mapbox://mapbox.mapbox-streets-v8",
          generateId: true,
        });

        this.polygon = this.map.addLayer({
          id: "building",
          generateId: true,
          source: "mapbox-streets",
          "source-layer": "building",
          type: "fill",
          paint: {
            "fill-color": "rgba(66,100,251, 0.3)",
            "fill-outline-color": "rgba(66,100,251, 1)",
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0.5,
            ],
          },
        });

        this.map.on("mousemove", "building", (e) => {
          if (e.features.length > 0) {
            if (this.hoveredStateId !== null) {
              this.map.setFeatureState(
                {
                  source: "mapbox-streets",
                  sourceLayer: "building",
                  id: this.hoveredStateId,
                },
                { hover: false }
              );
            }
            this.hoveredStateId = e.features[0].id;
            this.map.setFeatureState(
              {
                source: "mapbox-streets",
                sourceLayer: "building",
                id: this.hoveredStateId,
              },
              { hover: true }
            );
          }
        });

        this.map.on("mouseleave", "building", () => {
          if (this.hoveredStateId !== null) {
            this.map.setFeatureState(
              {
                source: "mapbox-streets",
                sourceLayer: "building",
                id: this.hoveredStateId,
              },
              { hover: false }
            );
          }
          this.hoveredStateId = null;
        });


        const popup = new this.$mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      
      this.map.on("mouseenter", "building", (e) => {

        this.map.getCanvas().style.cursor = "pointer";

        const coordinates = e.lngLat;
        description = null
        this.getAddressHover(coordinates);
        
        description = this.hoverlocation.features[0].place_name
        // const description = e.features[0].properties.description;

        popup.setLngLat(coordinates).setHTML(description).addTo(this.map);
      });

      this.map.on("mouseleave", "building", () => {
        description = null
        this.map.getCanvas().style.cursor = "";
        popup.remove();
      });
      });

      

      this.initHoverBuilding(this.map);
    },

    initHoverBuilding(map) {
      map.on("style.load", function () {
        const layers = map.getStyle().layers;
        const labelLayerId = layers.find(
          (layer) => layer.type === "symbol" && layer.layout["text-field"]
        ).id;
        if (map.getSource("composite")) {
          map.addLayer(
            {
              id: "3d-buildings",
              source: "composite",
              "source-layer": "building",
              filter: ["==", "extrude", "true"],
              type: "fill-extrusion",
              minzoom: 15,
              paint: {
                "fill-extrusion-color": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  "#aaa",
                  "#aaa",
                ],
                "fill-extrusion-height": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  ["get", "height"],
                  0,
                ],
                "fill-extrusion-base": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  ["get", "base_height"],
                  0,
                ],
              },
            },
            labelLayerId
          );
        }
        let fHover;
        map.on("mousemove", function (e) {
          //157001066
          var features = map.queryRenderedFeatures(e.point, {
            layers: ["3d-buildings"],
          });
          if (features[0]) {
            mouseout();
            mouseover(features[0]);
          } else {
            mouseout();
          }
        });
        map.on("mouseout", function (e) {
          mouseout();
        });
        function mouseout() {
          if (!fHover) return;
          map.getCanvasContainer().style.cursor = "default";
          map.setFeatureState(
            {
              source: fHover.source,
              sourceLayer: fHover.sourceLayer,
              id: fHover.id,
            },
            {
              hover: false,
            }
          );
        }
        function mouseover(feature) {
          fHover = feature;
          map.getCanvasContainer().style.cursor = "pointer";
          map.setFeatureState(
            {
              source: fHover.source,
              sourceLayer: fHover.sourceLayer,
              id: fHover.id,
            },
            {
              hover: true,
            }
          );
        }
      });
    },

    setNewMarker() {
      this.marker = new this.$mapboxgl.Marker({
        color: "red",
        draggable: true,
      })
        .setLngLat(this.coordinates)
        .addTo(this.map);

      this.marker.on("dragend", this.onDragEnd);
    },

    buildingZoom(coordinates) {
      this.map.fitBounds(coordinates, {
        zoom: 19,
      });
    },

    setAutoFill() {
      this.search = this.$search.autofill({
        accessToken: this.access_token,
        options: { country: "us" },
      });
    },

    onDragEnd() {
      this.coordinates = this.marker.getLngLat();
    },

    onAddressChange() {
      this.search.addEventListener("retrieve", (event) => {
        this.coordinates.lat = event.detail.features[0].geometry.coordinates[1];
        this.coordinates.lng = event.detail.features[0].geometry.coordinates[0];
        console.log(this.coordinates);
        this.map.easeTo({
          center: this.coordinates,
          zoom: 15,
          speed: 3,
          duration: 2500,
          curve: 2,
        });
        this.addPolygon();
      });
    },

    async getAddress() {
      let params = {
        lat: this.coordinates.lat,
        lng: this.coordinates.lng,
      };
      await this.$store.dispatch("locations/get", params);
      this.inputs.address = this.items.features[0].place_name;
      // this.addPolygon();
    },

    async getAddressHover(coordinates){
      let params = {
        lat: coordinates.lat,
        lng: coordinates.lng,
      };
      await this.$store.dispatch("locationhover/get", params);
    },

    addParcel(coordinates) {
      if (this.map.getSource("parcel")) {
        this.map.removeLayer("parcelLayer");
        // this.map.removeLayer("outline");
        this.map.removeSource("parcel");
      }

      this.map.addSource("parcel", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            // These coordinates outline Maine.
            coordinates: [coordinates],
          },
        },
      });

      this.map.addLayer({
        id: "parcelLayer",
        type: "fill",
        source: "parcel", // reference the data source
        layout: {},
        paint: {
          "fill-color": "#0080ff", // blue color fill
          "fill-opacity": 0.5,
        },
      });
    },

    filterData(parseJson) {
      this.geojsonArrays = [];
      parseJson.forEach((item) => {
        let itemArray = [item[1], item[0]];
        this.geojsonArrays.push(itemArray);
      });
    },
  },

  watch: {
    coordinates: {
      deep: true,
      handler(value, old) {
        this.getAddress();
        this.marker.setLngLat(this.coordinates);
        console.log(this.marker.getLngLat());
        this.map.easeTo({
          center: this.coordinates,
          zoom: 16,
          speed: 3,
          duration: 2500,
          curve: 2,
        });
      },
    },

    search: {
      deep: true,
      handler(value, old) {
        this.onAddressChange();
      },
    },
  },
};
</script>
<style>
#map {
  width: 100%;
  height: 100vh;
}
</style>
