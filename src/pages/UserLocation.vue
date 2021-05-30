<template>
  <section class="ui two column centered grid">
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
              <i class="circle icon"></i>
            </div>
          </div>
          <button class="ui button" @click="locatorButtonPressed">Go</button>
        </div>
      </form>
    </div>
  </section>
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
      document.getElementById("autocomplete")
    );
  },
  methods: {
    locatorButtonPressed() {
      this.spinner = true;

      //check if the browser is support location
      if (navigator.geolocation) {
        //Prompt user permission for knowing location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.getAddressFrom(
              position.coords.latitude,
              position.coords.longitude
            );
          },
          (error) => {
            console.log(error.message);
          }
        );

        this.spinner = false;
        return;
      }
    },
    getAddressFrom(lat, long) {
      axios
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyC4_m7mmLO59skzR9hyYEj1sgxKuHjtzo4`
        )
        .then((response) => {
          if (response.data.error_message) {
            throw error_message;
          }
          this.spinner = false;
          this.address = response.data.results[0].formatted_address;
        })
        .catch((err) => {
          console.log(err);
          this.spinner = false;
        });
    },
  },
};
</script>
<style scoped>
.ui.button,
.dot.circle.icon {
  background-color: #ff5a5f;
  color: white;
}
</style>