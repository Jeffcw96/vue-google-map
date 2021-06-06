<template>
  <div>
    <section
      class="ui two column centered grid"
      style="position: relative; z-index: 1"
    >
      <div class="column">
        <form class="ui segment large form" @submit.prevent="">
          <div class="ui message red" v-show="error">
            Please enter your location manually
          </div>
          <div class="ui segment">
            <div class="field">
              <div
                class="ui right icon input large"
                :class="{ loading: spinner }"
              >
                <input
                  type="text"
                  placeholder="Enter your address"
                  v-model="address"
                  id="autocomplete"
                />
                <i
                  class="dot link circle icon"
                  @click="locatorButtonPressed"
                ></i>
              </div>
            </div>
            <button class="ui button">Go</button>
          </div>
        </form>
      </div>
    </section>
    <section id="map" ref="map"></section>
  </div>
</template>
<script>
import axios from "axios";
export default {
  data() {
    return {
      address: "",
      error: "",
      spinner: false,
    };
  },
  mounted() {
    new google.maps.places.Autocomplete(
      document.getElementById("autocomplete"),
      {
        bounds: new google.maps.LatLngBounds(new google.maps.LatLng()),
      }
    );

    new google.maps.Map(document.getElementById("map"), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    });
  },
  methods: {
    async locatorButtonPressed() {
      try {
        this.spinner = true;
        //check if the browser is support location
        if (navigator.geolocation) {
          const { latitude, longitude } = await this.currentLatAndLong();
          this.getAddressFrom(latitude, longitude);
          this.showUserLocation(latitude, longitude);

          return;
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        this.spinner = false;
      }
    },
    showUserLocation(latitude, longitude) {
      // Show & center the Map based oon
      var map = new google.maps.Map(this.$refs["map"], {
        zoom: 15,
        center: new google.maps.LatLng(latitude, longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });

      new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: map,
      });
    },
    async getAddressFrom(lat, long) {
      try {
        const result = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyC4_m7mmLO59skzR9hyYEj1sgxKuHjtzo4`
        );
        const { formatted_address } = result.data.results[0];

        if (result.data.error_message) throw error_message;
        this.address = formatted_address;
        this.spinner = false;
      } catch (error) {
        console.log(err);
        this.spinner = false;
      }
    },
    currentLatAndLong() {
      // axios
      //   .get("https://maps.googleapis.com/maps/api/geocode/json")
      //   .then((response) => {
      //     console.log("response", response);
      //   });

      return new Promise((resolve, reject) => {
        //Prompt user permission for knowing location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (position.coords.latitude && position.coords.longitude) {
              console.log(
                position.coords.latitude && position.coords.longitude
              );
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            }
          },
          (error) => {
            reject(error.message);
          },
          { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true }
        );
      });
    },
  },
};
</script>
<style>
.ui.button,
.dot.circle.icon {
  background-color: #ff5a5f;
  color: white;
}

.pac-icon {
  display: none !important;
}

.pac-item {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}

.pac-item:hover {
  background-color: #ececec;
}

.pac-item-query {
  font-size: 16px;
}

#map {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>