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
      this.search.addEventListener("retrive", (event) => {
        console.log(event);
        this.coordinates = event.detail.features[0].geometry.coordinates;
        this.map.easeTo({
          center: this.coordinates,
          zoom: 15,
          speed: 3,
          duration: 2500,
          curve: 2,
        });
      });
      console.log(this.marker);
    },

    async getAddress(){
      try {
        let response = await this.$axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${this.coordinates.lng},${this.coordinates.lat}.json?access_token=pk.eyJ1IjoiamF2eTNyMTgiLCJhIjoiY2w4b3Q3aTdmMDB6djNvbzhycGtmYXF1MSJ9.55Zc-lWR2Oc7YzjBt9S5ow`
        );
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
        console.log(this.inputs)
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
