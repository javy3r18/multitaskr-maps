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
      polygoncenter: null,
      mouseHover: null,
    };
  },

  computed: {
    ...mapGetters({
      items: "locations/items",
      hoverlocation: "locationhover/items",
      geojson: "geojson/geojson",
      polygons: "polygons/polygons",
    }),
  },

  mounted() {
    this.createMap();
    this.setNewMarker();
    this.setAutoFill();
  },

  methods: {
    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/javy3r18/cl9dadrif008314pd2aja3j6t",
        zoom: 16,
        center: this.coordinates,
      });

      

      this.map.on("load", () => {

        this.map.removeLayer("test");

        this.map.addSource("parceltest2", {
          type: "vector",
          url: "mapbox://javy3r18.parceltest2",
          generateId: true,
        });

        this.map.addLayer({
          id: "test",
          generateId: true,
          source: "parceltest2",
          "source-layer": "test",
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

        this.map.on("mousemove", "test", (e) => {
          let content = this.map.queryRenderedFeatures(e.point, {
            layers: ["test"],
          });
          let id = content[0].id
          if(this.mouseHover != id){
            this.mouseHover = content[0].id
            

            if (e.features.length > 0) {
            if (this.hoveredStateId !== null) {
              this.map.setFeatureState(
                {
                  source: "parceltest2",
                  sourceLayer: "test",
                  id: this.hoveredStateId,
                },
                { hover: false }
              );
            }
            this.hoveredStateId = e.features[0].id;
            this.map.setFeatureState(
              {
                source: "parceltest2",
                sourceLayer: "test",
                id: this.hoveredStateId,
              },
              { hover: true }
            );
          }
          }
        });

        this.map.on("mouseleave", "test", () => {
          if (this.hoveredStateId !== null) {
            this.map.setFeatureState(
              {
                source: "parceltest2",
                sourceLayer: "test",
                id: this.hoveredStateId,
              },
              { hover: false }
            );
          }
          this.hoveredStateId = null;
        });

      });
    },

    setNewMarker() {
      this.marker = new this.$mapboxgl.Marker({
        color: "red",
        draggable: true,
      })
        .setLngLat(this.coordinates)
        .addTo(this.map);
    },

    setAutoFill() {
      this.search = this.$search.autofill({
        accessToken: this.access_token,
        options: { country: "us" },
      });
    },

    locationCenter() {
      this.map.easeTo({
        center: this.coordinates,
        zoom: 15,
        speed: 3,
        duration: 2500,
        curve: 2,
      });
    },

    onAddressChange() {
      this.search.addEventListener("retrieve", (event) => {
        this.coordinates.lat = event.detail.features[0].geometry.coordinates[1];
        this.coordinates.lng = event.detail.features[0].geometry.coordinates[0];
        this.locationCenter();
      });
    },

    async getAddress() {
      let params = {
        lat: this.coordinates.lat,
        lng: this.coordinates.lng,
      };
      await this.$store.dispatch("locations/get", params);
      this.inputs.address = this.items.features[0].place_name;
    },
  },

  watch: {
    coordinates: {
      deep: true,
      handler(value, old) {
        this.getAddress();
        this.marker.setLngLat(this.coordinates);
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
