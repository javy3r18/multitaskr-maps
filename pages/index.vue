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
            <input
            v-model="inputs.aparment"
              class="my-2"
              name="apartment"
              placeholder="Apartment number"
              type="text"
              autocomplete="address-line2"
            />
            <input
            v-model="inputs.city"
              class="my-2"
              name="city"
              placeholder="City"
              type="text"
              autocomplete="address-level2"
            />
            <input
            v-model="inputs.state"
              class="my-2"
              name="state"
              placeholder="State"
              type="text"
              autocomplete="address-level1"
            />
            <input
            v-model="inputs.country"
              class="my-2"
              name="country"
              placeholder="Country"
              type="text"
              autocomplete="country"
            />
            <input
            v-model="inputs.postcode"
              class="my-2"
              name="postcode"
              placeholder="Postcode"
              type="text"
              autocomplete="postal-code"
            />
          </form>
        </div>
      </b-col>
      <b-col cols="10">
        <div id="map"></div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import {mapGetters} from 'vuex'
export default {
  data() {
    return {
      access_token:
        "pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g",
      map: {},
      marker: {},
      search: {},
      geo: null,
      coord: null,
      inputs: {
        address: null,
        aparment: null,
        city: null,
        state: null,
        country: null,
        postcode: null
      },
      coordinates: {
        lng: -117.04342,
        lat: 32.55252,
      },

    };
  },

  mounted() {
    this.createMap();
    this.setNewMarker();
    this.setAutoFill();
  },

  methods: {
    // init() {
    //   let successCallback = (location) => {
    //     this.success = true;
    //     this.coordinates.lat = location.coords.latitude;
    //     this.coordinates.lng = location.coords.longitude;
    //     this.createMap();
    //   };
    //   let errorCallback = (location) => {
    //     console.log("Error Location");
    //   };
    //   navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    // },

    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: 11,
        center: this.coordinates,
      });

      this.map.on("load", () => {
                // Insert the layer beneath any symbol layer.
                const layers = this.map.getStyle().layers;
                const labelLayerId = layers.find(
                    (layer) =>
                        layer.type === "symbol" && layer.layout["text-field"]
                ).id;
                // The 'building' layer in the Mapbox Streets
                // vector tileset contains building height data
                // from OpenStreetMap.
                this.map.addLayer(
                    {
                        id: "add-3d-buildings",
                        source: "composite",
                        "source-layer": "building",
                        filter: ["==", "extrude", "true"],
                        type: "fill-extrusion",
                        minzoom: 15,
                        transition: {
                            duration: 300,
                            delay: 0,
                        },
                        paint: {
                            "fill-extrusion-color": "#aaa",
                            // Use an 'interpolate' expression to
                            // add a smooth transition effect to
                            // the buildings as the user zooms in.
                            "fill-extrusion-height": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                15,
                                0,
                                15.05,
                                ["get", "height"],
                            ],
                            "fill-extrusion-base": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                15,
                                0,
                                15.05,
                                ["get", "min_height"],
                            ],
                            "fill-extrusion-opacity": 0.6,
                        },
                    },
                    labelLayerId
                );
                this.addPolygon();
            });

    },

    addPolygon() {
            this.map.addSource("maine", {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        // These coordinates outline Maine.
                        coordinates: [
                            [
                                [-117.04032221565436,32.56788775850487],
                                [-117.04047227600599,32.56772503030933],
                                [-117.04145086617561,32.562454274516284],
                                [-117.03323380160447,32.562619119624316],
                                [-117.028235431521,32.56763679941878]
                            ],
                        ],
                    },
                },
            });
            // Add a new layer to visualize the polygon.
            this.map.addLayer({
                id: "maine",
                type: "fill",
                source: "maine", // reference the data source
                layout: {},
                paint: {
                    "fill-color": "#0080ff", // blue color fill
                    "fill-opacity": 0.5,
                },
            });
            // Add a black outline around the polygon.
            this.map.addLayer({
                id: "outline",
                type: "line",
                source: "maine",
                layout: {},
                paint: {
                    "line-color": "#000",
                    "line-width": 3,
                },
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

    setAutoFill() {
      this.search = this.$search.autofill({
        accessToken: this.access_token,
        options: { country: "us" },
      });
    },

    onDragEnd() {
      this.coordinates = this.marker.getLngLat();
      console.log(this.coordinates);
    },

    onAddressChange() {
      this.search.addEventListener("retrieve", (event) => {
        console.log(event);
        this.coordinates = event.detail.features[0].geometry.coordinates;
        this.map.easeTo({
          center: this.coordinates,
          zoom: 15,
          speed: 3,
          duration: 2500,
          curve: 2,
        });
        console.log(this.coordinates)
      });
      console.log(this.marker);
    },

    async getAddress(){
      try {
        let response = await this.$axios.get(
          'https://api.mapbox.com/geocoding/v5/mapbox.places/' +  this.coordinates.lng.toString() +',' + this.coordinates.lat.toString() + '.json?access_token=pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g'
        );
        this.inputs.address = response.data.features[0].place_name
        console.log(response)
      } catch (e) {
        console.error(e);
      }
    
    }


  },

  watch: {
    coordinates: {
      deep: true,
      handler(value, old) {
       this.getAddress();
        this.marker.setLngLat(this.coordinates);
        this.map.easeTo({
          center: this.coordinates,
          zoom: 15,
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

    inputs: {
      deep: true,
      handler(value, old) {

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
